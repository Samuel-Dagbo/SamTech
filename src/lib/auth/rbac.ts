/**
 * Role-based access control. Permissions map to roles so new roles can be
 * added later without scattering authorization checks through components.
 */

export const ROLES = ["founder", "team_member"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  founder: "Founder",
  team_member: "Team Member",
};

export const DEPARTMENTS = ["secretary", "marketing", "developer", "tester"] as const;
export type Department = (typeof DEPARTMENTS)[number];

export const DEPARTMENT_LABELS: Record<Department, string> = {
  secretary: "Secretary / Operations",
  marketing: "Digital Marketing",
  developer: "Developer / Technical",
  tester: "Tester / QA",
};

/**
 * Permissions implicitly granted by role. Team members holding an explicit
 * scope (User.scopes) can reach founder-included capabilities beyond this map —
 * except the sensitive grants below, which are never assignable to staff:
 * cms.manage, messages.manage, audit.view, settings.manage, team.*, tasks/jobs
 * of account administration stay founder-only in every case.
 */
export const PERMISSIONS = {
  "workspace.view": ["founder", "team_member"],
  "directory.view": ["founder", "team_member"],
  "announcements.view": ["founder", "team_member"],
  "resources.view": ["founder", "team_member"],
  "tasks.update-own": ["founder", "team_member"],
  "tasks.manage": ["founder"],
  "announcements.publish": ["founder"],
  "team.manage": ["founder"],
  "team.invite": ["founder"],
  "resources.manage": ["founder"],
  "marketing.manage": ["founder"],
  "cms.manage": ["founder"],
  "messages.manage": ["founder"],
  "audit.view": ["founder"],
  "settings.manage": ["founder"],
} as const satisfies Record<string, readonly Role[]>;

export type Permission = keyof typeof PERMISSIONS;

/** Scopes the founder may assign to staff accounts. */
export const GRANTABLE_SCOPES = [
  "tasks.manage",
  "announcements.publish",
  "resources.manage",
  "marketing.manage",
] as const satisfies readonly Permission[];

export type GrantableScope = (typeof GRANTABLE_SCOPES)[number];

/** Role-only resolution (implicit per-role defaults). */
export function can(role: Role, permission: Permission): boolean {
  return (PERMISSIONS[permission] as readonly Role[]).includes(role);
}

/**
 * Principal-aware resolution: founder ⇒ everything; staff ⇒ implicit role
 * permissions plus any individually assigned scopes.
 */
export function canUser(
  principal: { role: Role; scopes?: readonly string[] },
  permission: Permission,
): boolean {
  if (principal.role === "founder") return true;
  if ((PERMISSIONS[permission] as readonly Role[]).includes(principal.role)) return true;
  return Boolean(principal.scopes?.includes(permission));
}

export function normalizeScopes(value: readonly string[] | undefined): string[] {
  return Array.from(new Set((value ?? []).filter((scope): scope is GrantableScope =>
    (GRANTABLE_SCOPES as readonly string[]).includes(scope),
  )));
}

export function normalizeDepartment(value: string | undefined | null): Department | undefined {
  if (!value) return undefined;
  return (DEPARTMENTS as readonly string[]).includes(value)
    ? (value as Department)
    : undefined;
}
