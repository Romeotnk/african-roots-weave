import { Role } from "@prisma/client";
import { prisma } from "../config/db.js";
import type { PermissionOverrides } from "../utils/permissions.js";

const CACHE_TTL_MS = 30_000;
let roleCache: { data: Map<Role, Set<string>>; expiresAt: number } | null = null;

const loadRolePermissions = async (): Promise<Map<Role, Set<string>>> => {
  const now = Date.now();
  if (roleCache && roleCache.expiresAt > now) return roleCache.data;

  const rows = await prisma.rolePermission.findMany();
  const map = new Map<Role, Set<string>>();
  for (const row of rows) {
    if (!map.has(row.role)) map.set(row.role, new Set());
    map.get(row.role)!.add(row.permission);
  }
  roleCache = { data: map, expiresAt: now + CACHE_TTL_MS };
  return map;
};

// Call after any admin write to RolePermission so the change is reflected
// immediately instead of waiting out the cache TTL.
export const invalidateRolePermissionsCache = () => {
  roleCache = null;
};

export const getRoleDefaultPermissions = async (role: Role): Promise<Set<string>> => {
  const map = await loadRolePermissions();
  return new Set(map.get(role) ?? []);
};

export const getEffectivePermissions = async (userId: string, role: Role): Promise<Set<string>> => {
  const rolePermissions = await getRoleDefaultPermissions(role);
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { permissionOverrides: true } });
  const overrides = (user?.permissionOverrides as PermissionOverrides | null) ?? null;

  const effective = new Set(rolePermissions);
  overrides?.grant?.forEach((permission) => effective.add(permission));
  overrides?.revoke?.forEach((permission) => effective.delete(permission));
  return effective;
};

export const hasPermission = async (userId: string, role: Role, permission: string): Promise<boolean> => {
  if (role === Role.SUPER_ADMIN) return true;
  const effective = await getEffectivePermissions(userId, role);
  return effective.has(permission);
};
