import { connectDB } from "@/lib/db";
import { getEnv, isMailjetConfigured } from "@/lib/env";
import { getIp, isSameOrigin, jsonError, jsonOk, logServerError } from "@/lib/http";
import { sendEmail } from "@/lib/mail/mailjet";
import { rateLimit } from "@/lib/rate-limit";
import { contactFieldErrors, contactSchema } from "@/lib/validation/contact";
import ContactMessage from "@/models/contact-message";

export async function POST(request: Request) {
  const ip = getIp(request);
  const limit = rateLimit(`contact:${ip}`, { limit: 5, windowMs: 10 * 60 * 1000 });
  if (!limit.ok) {
    return jsonError(429, "Too many messages sent. Please try again later.", {
      retryAfter: limit.retryAfterSeconds,
    });
  }

  if (!isSameOrigin(request)) {
    return jsonError(403, "Invalid request origin.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Invalid request body.");
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(422, "Please correct the highlighted fields.", {
      errors: contactFieldErrors(parsed.error),
    });
  }

  const data = parsed.data;

  // Honeypot: silently accept so bots believe the submission worked.
  if (data.website) {
    return jsonOk({ message: "Message sent." });
  }

  try {
    await connectDB();
    await ContactMessage.create({
      name: data.name,
      email: data.email,
      phone: data.phone || undefined,
      message: data.message,
      source: "website",
    });
  } catch (error) {
    logServerError("contact", error);
    return jsonError(503, "Unable to save your message right now. Please try WhatsApp or email.");
  }

  // Best-effort notification — delivery failure must never fail the request.
  const env = getEnv();
  const notifyEmail = env.CONTACT_NOTIFY_EMAIL || env.MAILJET_FROM_EMAIL;
  if (isMailjetConfigured() && notifyEmail) {
    const result = await sendEmail({
      to: notifyEmail,
      subject: `New contact message from ${data.name}`,
      text: `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone || "—"}\n\n${data.message}`,
      html: `<p><strong>Name:</strong> ${data.name}</p><p><strong>Email:</strong> ${data.email}</p><p><strong>Phone:</strong> ${data.phone || "—"}</p><hr><p>${data.message.replace(/\n/g, "<br>")}</p>`,
    });
    if (!result.sent) {
      console.warn(`[contact] Notification email not sent: ${result.error}`);
    }
  }

  return jsonOk({ message: "Message sent." }, 201);
}
