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

export const PERMISSIONS = {
  "workspace.view": ["founder", "team_member"],
  "tasks.manage": ["founder"],
  "tasks.update-own": ["founder", "team_member"],
  "announcements.publish": ["founder"],
  "team.manage": ["founder"],
  "team.invite": ["founder"],
  "resources.manage": ["founder"],
  "cms.manage": ["founder"],
  "audit.view": ["founder"],
  "settings.manage": ["founder"],
} as const satisfies Record<string, readonly Role[]>;

export type Permission = keyof typeof PERMISSIONS;

export function can(role: Role, permission: Permission): boolean {
  return (PERMISSIONS[permission] as readonly Role[]).includes(role);
}
