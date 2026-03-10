import { db } from '../db/index.js';
import { roles, rolePermissions } from '../db/schema/index.js';
import { eq } from 'drizzle-orm';

export const permissionsService = {
    async findAllRoles() {
        return db.query.roles.findMany({
            with: { permissions: true },
        });
    },

    async findRoleById(id: string) {
        return db.query.roles.findFirst({
            where: eq(roles.id, id),
            with: { permissions: true },
        });
    },

    async createRole(data: { id: string; name: string; permissions: string[] }) {
        const [role] = await db.insert(roles).values({ id: data.id, name: data.name }).returning();

        if (data.permissions.length > 0) {
            await db.insert(rolePermissions).values(
                data.permissions.map((key) => ({ roleId: data.id, permissionKey: key }))
            );
        }

        return role;
    },

    async updateRolePermissions(roleId: string, permissions: string[]) {
        // Delete existing permissions
        await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));

        // Insert new permissions
        if (permissions.length > 0) {
            await db.insert(rolePermissions).values(
                permissions.map((key) => ({ roleId, permissionKey: key }))
            );
        }

        return this.findRoleById(roleId);
    },

    async deleteRole(id: string) {
        const [deleted] = await db.delete(roles).where(eq(roles.id, id)).returning();
        return deleted;
    },

    async getPermissionKeysForRole(roleId: string): Promise<string[]> {
        const perms = await db
            .select({ key: rolePermissions.permissionKey })
            .from(rolePermissions)
            .where(eq(rolePermissions.roleId, roleId));
        return perms.map((p) => p.key);
    },
};
