import { getAuthenticatedUser } from "@/lib/auth";

const ADMIN_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "FINANCE_ADMIN",
  "CRYPTO_ADMIN",
  "SUPPORT_ADMIN",
  "CONTENT_ADMIN",
  "MODERATOR",
];

export async function getAuthenticatedAdmin(request: Request) {
  const auth = await getAuthenticatedUser(request);

  if (!auth) {
    return null;
  }

  const adminRoles = auth.roles.filter((role) =>
    ADMIN_ROLES.includes(role)
  );

  if (adminRoles.length === 0) {
    return null;
  }

  return {
    ...auth,
    adminRoles,
  };
}

export function hasAdminRole(
  roles: string[],
  requiredRole: string
) {
  return roles.includes(requiredRole);
}

export function hasAnyAdminRole(
  roles: string[],
  requiredRoles: string[]
) {
  return requiredRoles.some((role) =>
    roles.includes(role)
  );
}