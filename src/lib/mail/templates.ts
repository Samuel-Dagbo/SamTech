import "server-only";

/**
 * Transactional email templates. Brand tokens: sand #f4edde, clay #bb4f2b,
 * forest #213631, ink #171411. Inline styles only (email clients strip <style>).
 */

function toText(contentHtml: string): string {
  return contentHtml
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&rsquo;/g, "’")
    .replace(/&nbsp;/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function layout(contentHtml: string, preheader: string): { html: string; text: string } {
  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background-color:#f4edde;font-family:Arial,Helvetica,sans-serif;">
    <span style="display:none;max-height:0;overflow:hidden;">${preheader}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4edde;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 12px 40px rgba(33,54,49,0.12);">
            <tr>
              <td style="background-color:#213631;padding:24px 32px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="width:40px;height:40px;background-color:#ffffff;border-radius:50%;text-align:center;vertical-align:middle;font-weight:bold;font-size:18px;color:#213631;">S</td>
                    <td style="padding-left:12px;color:#f8f1e7;font-size:13px;letter-spacing:2px;text-transform:uppercase;">SamTech Labs</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;color:#171411;">
                ${contentHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px 28px;border-top:1px solid #efe7db;color:#8a8378;font-size:12px;line-height:18px;">
                SamTech Labs — modern web and mobile products with strong backend engineering.<br />
                If you were not expecting this email, you can safely ignore it.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
  return { html, text: toText(contentHtml) };
}

export function invitationEmail(input: {
  name: string;
  title?: string;
  roleLabel: string;
  welcomeMessage?: string;
  acceptUrl: string;
  expiresAt: Date;
}): { subject: string; html: string; text: string } {
  const firstName = input.name.split(" ")[0] || input.name;
  const expiry = input.expiresAt.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const subject = `You're invited to join the SamTech Labs workspace`;
  const { html } = layout(
    `
    <h1 style="margin:0 0 8px;font-size:24px;line-height:32px;color:#171411;">Welcome, ${firstName}.</h1>
    <p style="margin:0 0 20px;font-size:15px;line-height:24px;color:#57534a;">
      You have been invited to join the SamTech Labs internal workspace${input.title ? ` as <strong style="color:#171411;">${input.title}</strong>` : ""}.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background-color:#f4edde;border-radius:16px;margin:0 0 24px;">
      <tr><td style="padding:16px 20px;font-size:14px;line-height:22px;color:#171411;">
        <strong>Position:</strong> ${input.roleLabel}${input.title ? ` — ${input.title}` : ""}<br />
        <strong>Invited email:</strong> ${input.name ? "the address this email was sent to" : ""}
      </td></tr>
    </table>
    ${input.welcomeMessage ? `<p style="margin:0 0 24px;font-size:15px;line-height:24px;color:#57534a;border-left:3px solid #bb4f2b;padding-left:14px;">${input.welcomeMessage}</p>` : ""}
    <p style="margin:0 0 12px;font-size:15px;line-height:24px;color:#57534a;">
      To activate your account, choose a strong password using the button below. The link expires on ${expiry}.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
      <tr>
        <td style="background-color:#171411;border-radius:999px;">
          <a href="${input.acceptUrl}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;">Set up my account</a>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:13px;line-height:20px;color:#8a8378;">
      If the button does not work, copy this link into your browser:<br />
      <span style="color:#57534a;word-break:break-all;">${input.acceptUrl}</span>
    </p>
    `,
    `Join the SamTech Labs workspace — link expires ${expiry}.`,
  );
  const text = [
    `Welcome to SamTech Labs, ${firstName}.`,
    "",
    input.title ? `Position: ${input.title}` : `Position: ${input.roleLabel}`,
    `Activate your account before ${expiry}:`,
    input.acceptUrl,
    "",
    "If you were not expecting this email, you can safely ignore it.",
  ].join("\n");
  return { subject, html, text };
}

export function passwordResetEmail(input: {
  resetUrl: string;
  expiresAt: Date;
}): { subject: string; html: string; text: string } {
  const expiry = input.expiresAt.toLocaleString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    day: "numeric",
    month: "short",
  });
  const subject = "Reset your SamTech Labs password";
  const { html } = layout(
    `
    <h1 style="margin:0 0 8px;font-size:24px;line-height:32px;color:#171411;">Password reset</h1>
    <p style="margin:0 0 20px;font-size:15px;line-height:24px;color:#57534a;">
      We received a request to reset the password for your SamTech Labs workspace account.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
      <tr>
        <td style="background-color:#171411;border-radius:999px;">
          <a href="${input.resetUrl}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;">Choose a new password</a>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 20px;font-size:13px;line-height:20px;color:#8a8378;">This link expires ${expiry} and can be used once.</p>
    <p style="margin:0;font-size:13px;line-height:20px;color:#8a8378;">
      If the button does not work, copy this link into your browser:<br />
      <span style="color:#57534a;word-break:break-all;">${input.resetUrl}</span>
    </p>
    `,
    "Password reset link — expires soon, single use.",
  );
  const text = [
    "We received a request to reset your SamTech Labs password.",
    "",
    `Choose a new password (expires ${expiry}, single use):`,
    input.resetUrl,
    "",
    "If you did not request this, you can safely ignore this email.",
  ].join("\n");
  return { subject, html, text };
}
