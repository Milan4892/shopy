import test from "node:test";
import assert from "node:assert/strict";

import { ADMIN_ROLES, hasAnyAdminRole } from "./admin-roles";

test("accepts any valid admin role for dashboard access", () => {
  assert.equal(
    hasAnyAdminRole(["SUPER_ADMIN", "CUSTOMER"], ADMIN_ROLES),
    true
  );

  assert.equal(
    hasAnyAdminRole(["CUSTOMER", "USER"], ADMIN_ROLES),
    false
  );
});
