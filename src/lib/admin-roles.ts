export const ADMIN_ROLES: string[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "FINANCE_ADMIN",
  "CRYPTO_ADMIN",
  "SUPPORT_ADMIN",
  "CONTENT_ADMIN",
  "MODERATOR",
];

export function hasAdminRole(
  roles: readonly string[],
  requiredRole: string
) {
  return roles.includes(requiredRole);
}

export function hasAnyAdminRole(
  roles: readonly string[],
  requiredRoles: readonly string[] = ADMIN_ROLES
) {
  return requiredRoles.some((role) => roles.includes(role));
}
