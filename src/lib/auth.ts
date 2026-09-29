import crypto from "crypto";
import { prisma } from "@/lib/prisma";

function hashSessionToken(token: string) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

export async function getAuthenticatedUser(
  request: Request
) {
  const cookieHeader = request.headers.get("cookie");

  if (!cookieHeader) {
    return null;
  }

  const sessionCookie = cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) =>
      cookie.startsWith("shoppy_session=")
    );

  if (!sessionCookie) {
    return null;
  }

  const sessionToken = sessionCookie.substring(
    "shoppy_session=".length
  );

  if (!sessionToken) {
    return null;
  }

  const tokenHash = hashSessionToken(sessionToken);

  const session = await prisma.session.findUnique({
    where: {
      tokenHash,
    },
    include: {
    user: {
  include: {
    roles: {
      include: {
        role: true,
      },
    },
    wallet: true,
ownedProducts: {
  include: {
    product: true,
  },
},
  },
},
    },
  });

  if (!session) {
    return null;
  }

  if (session.status !== "ACTIVE") {
    return null;
  }

  if (session.expiresAt <= new Date()) {
    await prisma.session.update({
      where: {
        id: session.id,
      },
      data: {
        status: "EXPIRED",
      },
    });

    return null;
  }

  if (session.user.status !== "ACTIVE") {
    return null;
  }

  await prisma.session.update({
    where: {
      id: session.id,
    },
    data: {
      lastActiveAt: new Date(),
    },
  });

  return {
    user: session.user,
    roles: session.user.roles.map(
      (userRole) => userRole.role.code
    ),
    session,
  };
}
