import { getAuthenticatedUser } from "@/lib/auth";
import {
  ADMIN_ROLES,
  hasAdminRole,
  hasAnyAdminRole,
} from "@/lib/admin-roles";

export { ADMIN_ROLES, hasAdminRole, hasAnyAdminRole };

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