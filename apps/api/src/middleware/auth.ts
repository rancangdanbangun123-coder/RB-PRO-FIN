import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import { auth } from '../auth/index.js';
import { db } from '../db/index.js';
import { rolePermissions } from '../db/schema/index.js';
import { ALL_PERMISSION_KEYS } from '../constants/permissions.js';
import { eq } from 'drizzle-orm';

// Type for the user attached to context
export type AuthUser = {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    image?: string | null;
};

// ── requireAuth middleware ──
// Verifies Better Auth session and attaches user to Hono context
export const requireAuth = createMiddleware<{
    Variables: {
        user: AuthUser;
        permissions: string[];
    };
}>(async (c, next) => {
    const session = await auth.api.getSession({
        headers: c.req.raw.headers,
    });

    if (!session || !session.user) {
        throw new HTTPException(401, { message: 'Unauthorized — no active session' });
    }

    const user = session.user as AuthUser;

    // Check if user is active
    if (user.status !== 'Active') {
        throw new HTTPException(403, { message: 'Account is inactive' });
    }

    // Fetch permissions for the user's role
    const perms = await db
        .select({ key: rolePermissions.permissionKey })
        .from(rolePermissions)
        .where(eq(rolePermissions.roleId, user.role.toLowerCase().replace(/\s+/g, '_')));

    const permKeys = perms.map((p) => p.key);

    c.set('user', user);
    if (user.role === 'Admin') {
        c.set('permissions', ALL_PERMISSION_KEYS.map((k) => k.key));
    } else {
        c.set('permissions', permKeys);
    }

    await next();
});

// ── requirePermission middleware ──
// Checks if the authenticated user has a specific permission
export function requirePermission(key: string) {
    return createMiddleware<{
        Variables: {
            user: AuthUser;
            permissions: string[];
        };
    }>(async (c, next) => {
        const permissions = c.get('permissions');

        if (!permissions || !permissions.includes(key)) {
            throw new HTTPException(403, {
                message: `Forbidden — missing permission: ${key}`,
            });
        }

        await next();
    });
}

// ── requireAnyPermission middleware ──
// Allows access if user has ANY of the listed permissions
export function requireAnyPermission(...keys: string[]) {
    return createMiddleware<{
        Variables: {
            user: AuthUser;
            permissions: string[];
        };
    }>(async (c, next) => {
        const permissions = c.get('permissions');

        if (!permissions || !keys.some((k) => permissions.includes(k))) {
            throw new HTTPException(403, {
                message: `Forbidden — requires one of: ${keys.join(', ')}`,
            });
        }

        await next();
    });
}
