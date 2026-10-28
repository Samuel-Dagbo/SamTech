import "server-only";
import { Buffer } from "node:buffer";
import { getEnv, isMailjetConfigured } from "../env";

/**
 * Minimal Mailjet REST client (v3.1 Send API). No SDK dependency.
 * Never logs recipient content beyond delivery success/failure metadata.
 */

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export type SendEmailResult =
  | { sent: true }
  | { sent: false; error: string };

export async function sendEmail({ to, subject, html, text }: SendEmailInput): Promise<SendEmailResult> {
  if (!isMailjetConfigured()) {
    return { sent: false, error: "Mailjet is not configured" };
  }

  const env = getEnv();
  const auth = Buffer.from(`${env.MAILJET_API_KEY}:${env.MAILJET_API_SECRET}`).toString("base64");

  try {
    const response = await fetch("https://api.mailjet.com/v3.1/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        Messages: [
          {
            From: {
              Email: env.MAILJET_FROM_EMAIL,
              Name: env.MAILJET_FROM_NAME || "SamTech Labs",
            },
            To: [{ Email: to }],
            Subject: subject,
            TextPart: text,
            HTMLPart: html,
          },
        ],
      }),
      // Transactions should fail fast; Mailjet typically responds < 3s.
      signal: AbortSignal.timeout(10_000),
    });

    if (response.ok) {
      const data = (await response.json().catch(() => null)) as
        | { Messages?: Array<{ Status?: string }> }
        | null;
      const status = data?.Messages?.[0]?.Status;
      if (status && status !== "success") {
        return { sent: false, error: `Mailjet reported status: ${status}` };
      }
      return { sent: true };
    }

    return { sent: false, error: `Mailjet responded with ${response.status}` };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { sent: false, error: message };
  }
}
