#!/usr/bin/env node
/**
 * Founder bootstrap — the ONLY supported way to create the initial founder
 * account. There is deliberately no HTTP endpoint that can create privileged
 * accounts (legacy anti-pattern: public /api/seed-admin).
 *
 * Invite mode (default): creates a founder INVITATION and emails it via
 * Mailjet. If Mailjet is not configured, the acceptance URL is printed here —
 * the script runs on the founder's own machine, so the link never leaves it.
 * The founder then sets their own password on the activation page.
 *
 *   node scripts\bootstrap-founder.mjs --name "Samuel Dagbo" --email you@samtechlabs.com
 *
 * Direct mode (offline fallback): sets the password immediately via env var.
 *   $env:FOUNDER_PASSWORD = "min-12-chars"
 *   node scripts\bootstrap-founder.mjs --direct --name "Samuel Dagbo" --email you@samtechlabs.com
 *
 * Safety: refuses if any founder or user already exists for the email. The
 * invitation token is stored ONLY as an HMAC (SESSION_SECRET); the raw token
 * is never persisted.
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const INVITE_TTL_HOURS = 72;

function loadEnvFile() {
  const candidates = [path.join(process.cwd(), ".env.local"), path.join(process.cwd(), ".env")];
  for (const file of candidates) {
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
      const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (match && !(match[1] in process.env)) {
        process.env[match[1]] = match[2].trim();
      }
    }
    return file;
  }
  return null;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { direct: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--name") out.name = args[++i];
    else if (args[i] === "--email") out.email = args[++i];
    else if (args[i] === "--title") out.title = args[++i];
    else if (args[i] === "--direct") out.direct = true;
  }
  return out;
}

function hashToken(token) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    console.error("SESSION_SECRET is missing (check .env.local) — it protects invitation tokens.");
    process.exit(1);
  }
  return crypto.createHmac("sha256", secret).update(token).digest("hex");
}

function mailjetConfigured() {
  const env = process.env;
  return Boolean(env.MAILJET_API_KEY && env.MAILJET_API_SECRET && env.MAILJET_FROM_EMAIL);
}

function invitationHtml({ name, roleLabel, acceptUrl, expiresAt }) {
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return [
    '<div style="font-family:Segoe UI,Arial,sans-serif;background:#f6f1e8;padding:32px 16px;">',
    '  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;">',
    `    <p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#b0573b;font-weight:700;">SamTech Labs workspace</p>`,
    `    <h1 style="margin:12px 0 8px;font-size:24px;color:#141414;">You're invited, ${esc(name)}</h1>`,
    `    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#444;">You have been invited to join the SamTech Labs internal workspace as <strong>${esc(roleLabel)}</strong>. Choose your own password on the activation page — the link is single-use and expires ${esc(expiresAt)}.</p>`,
    `    <p style="margin:0 0 24px;"><a href="${acceptUrl}" style="display:inline-block;background:#141414;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:600;font-size:14px;">Activate my account</a></p>`,
    `    <p style="margin:0;font-size:12px;color:#888;">If the button does not work, copy this link into your browser:<br><span style="word-break:break-all;">${acceptUrl}</span></p>`,
    "  </div>",
    "</div>",
  ].join("\n");
}

async function sendViaMailjet({ to, subject, html, text }) {
  const auth = Buffer.from(`${process.env.MAILJET_API_KEY}:${process.env.MAILJET_API_SECRET}`).toString("base64");
  const response = await fetch("https://api.mailjet.com/v3.1/send", {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      Messages: [
        {
          From: { Email: process.env.MAILJET_FROM_EMAIL, Name: process.env.MAILJET_FROM_NAME || "SamTech Labs" },
          To: [{ Email: to }],
          Subject: subject,
          HTMLPart: html,
          TextPart: text,
        },
      ],
    }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    return { sent: false, error: `Mailjet HTTP ${response.status}${detail ? `: ${detail.slice(0, 200)}` : ""}` };
  }
  return { sent: true };
}

async function inviteMode({ name, email, title }) {
  const appUrl = (process.env.APP_URL || "http://localhost:3000").replace(/\/+$/, "");
  const db = mongoose.connection.db;
  const users = db.collection("users");
  const invitations = db.collection("invitations");

  const existingFounder = await users.findOne({ role: "founder" });
  if (existingFounder) {
    console.error(`A founder account already exists (${existingFounder.email}). Bootstrap aborted.`);
    process.exit(1);
  }
  const existingUser = await users.findOne({ email });
  if (existingUser) {
    console.error("That email already belongs to an account. Bootstrap aborted.");
    process.exit(1);
  }

  // Only one live invitation per email.
  await invitations.updateMany({ email, status: "pending" }, { $set: { status: "revoked" } });

  const rawToken = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + INVITE_TTL_HOURS * 60 * 60 * 1000);
  const now = new Date();
  const insert = await invitations.insertOne({
    email,
    name: name.trim(),
    title: title ? title.trim() : "Founder",
    role: "founder",
    status: "pending",
    tokenHash: hashToken(rawToken),
    invitedBy: null,
    welcomeMessage:
      "You are activating the founder account for the SamTech Labs workspace. Set a strong password (12+ characters) to get started.",
    expiresAt,
    createdAt: now,
    updatedAt: now,
  });

  const acceptUrl = `${appUrl}/invite/accept?token=${encodeURIComponent(rawToken)}`;
  const expiresLabel = expiresAt.toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short" });
  const subject = "Activate your SamTech Labs founder account";
  const text = `Hello ${name},\n\nYou have been invited to activate the ${title || "Founder"} account for the SamTech Labs workspace.\nOpen this single-use link within 72 hours (expires ${expiresLabel}) and choose your password:\n\n${acceptUrl}\n\nIf you did not expect this email, you can ignore it.`;

  if (mailjetConfigured()) {
    const outcome = await sendViaMailjet({ to: email, subject, html: invitationHtml({ name, roleLabel: title || "Founder", acceptUrl, expiresAt: expiresLabel }), text });
    if (outcome.sent) {
      await invitations.updateOne({ _id: insert.insertedId }, { $set: { emailSentAt: new Date() }, $unset: { emailError: "" } });
      console.log(`Invitation email sent to ${email} via Mailjet.`);
      console.log("Open the link from your inbox, set your password, then sign in at /login.");
    } else {
      await invitations.updateOne({ _id: insert.insertedId }, { $set: { emailError: outcome.error } });
      console.warn(`Mailjet delivery failed (${outcome.error}).`);
      console.log(`Fallback — activation URL (valid until ${expiresLabel}):\n  ${acceptUrl}`);
    }
  } else {
    console.log("Mailjet is not configured — printing the activation URL instead.");
    console.log(`Activation URL (valid until ${expiresLabel}):\n  ${acceptUrl}`);
    console.log("Set MAILJET_* values in .env.local later; use Resend in the workspace to email it.");
  }

  console.log("Delete the invitation from the database if it was exposed to anyone else.");
}

async function directMode({ name, email, title }) {
  const password = process.env.FOUNDER_PASSWORD;
  if (!password || password.length < 12) {
    console.error('Set a strong password first: $env:FOUNDER_PASSWORD = "..." (min 12 chars). It is never printed.');
    process.exit(1);
  }

  const db = mongoose.connection.db;
  const users = db.collection("users");

  const existingFounder = await users.findOne({ role: "founder" });
  if (existingFounder) {
    console.error(`A founder account already exists (${existingFounder.email}). Bootstrap aborted.`);
    process.exit(1);
  }
  const existingUser = await users.findOne({ email });
  if (existingUser) {
    console.error("That email already belongs to an account. Bootstrap aborted.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const now = new Date();
  await users.insertOne({
    name: name.trim(),
    email,
    passwordHash,
    role: "founder",
    title: title ? title.trim() : "Founder",
    status: "active",
    createdAt: now,
    updatedAt: now,
  });

  console.log(`Founder account created for ${email}.`);
  console.log("Sign in at /login. Delete FOUNDER_PASSWORD from your shell if you exported it.");
}

async function main() {
  loadEnvFile();
  const { name, email, title, direct } = parseArgs();

  if (!name || !email) {
    console.error('Usage: node scripts\\bootstrap-founder.mjs --name "Full Name" --email you@example.com [--title "Founder"] [--direct]');
    process.exit(1);
  }
  const normalizedEmail = email.toLowerCase().trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    console.error("Invalid email address.");
    process.exit(1);
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is missing (check .env.local).");
    process.exit(1);
  }

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });

  if (direct) {
    await directMode({ name, email: normalizedEmail, title });
  } else {
    await inviteMode({ name, email: normalizedEmail, title });
  }

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error("Bootstrap failed:", error.message);
  process.exit(1);
});
