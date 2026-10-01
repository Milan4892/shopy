import { getAuthenticatedUser } from "@/lib/auth";
import { ADMIN_ROLES, hasAnyAdminRole } from "@/lib/admin-roles";
import { RoleCode } from "@/generated/prisma/enums";
export async function requireAuth(request: Request) {
  const auth = await getAuthenticatedUser(request);

  if (!auth) {
    return {
      authenticated: false as const,
      response: new Response(
        JSON.stringify({
          success: false,
          message: "Authentication required.",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      ),
    };
  }

  return {
    authenticated: true as const,
    auth,
  };
}

export async function requireRole(
  request: Request,
 requiredRole: RoleCode
) {
  const auth = await getAuthenticatedUser(request);

  if (!auth) {
    return {
      authenticated: false as const,
      authorized: false as const,
      response: new Response(
        JSON.stringify({
          success: false,
          message: "Authentication required.",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      ),
    };
  }

  if (!auth.roles.includes(requiredRole)) {
    return {
      authenticated: true as const,
      authorized: false as const,
      response: new Response(
        JSON.stringify({
          success: false,
          message:
            "You do not have permission to access this resource.",
        }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
          },
        }
      ),
    };
  }

  return {
    authenticated: true as const,
    authorized: true as const,
    auth,
  };
}