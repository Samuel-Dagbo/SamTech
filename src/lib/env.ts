import "server-only";
import { z } from "zod";

/**
 * Server-only environment configuration.
 *
 * Validation is lazy (`getEnv`) so that modules importing env can be *compiled*
 * during `next build` (e.g. sitemap) without a database connection present.
 * Runtime failures are loud, never silent (anti-recurrence of legacy issue L1).
 */

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  MONGODB_URI: z.string().trim().min(1, "MONGODB_URI is required"),
  APP_URL: z
    .string()
    .trim()
    .default("https://samtechlabs.vercel.app")
    .refine((value) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    }, "APP_URL must be a valid absolute URL"),
  MAILJET_API_KEY: z.string().trim().optional(),
  MAILJET_API_SECRET: z.string().trim().optional(),
  MAILJET_FROM_EMAIL: z
    .string()
    .trim()
    .refine((value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), "MAILJET_FROM_EMAIL must be an email address")
    .optional(),
  MAILJET_FROM_NAME: z.string().trim().optional(),
  CONTACT_NOTIFY_EMAIL: z
    .string()
    .trim()
    .refine((value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), "CONTACT_NOTIFY_EMAIL must be an email address")
    .optional(),
  SESSION_SECRET: z.string().trim().optional(),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function getEnv(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const summary = parsed.error.issues
      .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid environment configuration — ${summary}`);
  }
  cached = parsed.data;
  return cached;
}

/** Public origin without requiring full env validation (build-safe). */
export function getPublicAppUrl(): string {
  const raw = process.env.APP_URL?.trim();
  if (raw) {
    try {
      return new URL(raw).origin;
    } catch {
      // fall through to default
    }
  }
  return "https://samtechlabs.vercel.app";
}

export function isMailjetConfigured(): boolean {
  const env = process.env;
  return Boolean(env.MAILJET_API_KEY && env.MAILJET_API_SECRET && env.MAILJET_FROM_EMAIL);
}
