import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../db/index.js';
import * as schema from '../db/schema/index.js';
import { user as userTable } from '../db/schema/index.js';
import { eq, count } from 'drizzle-orm';
import 'dotenv/config';

export const auth = betterAuth({
    basePath: '/api/auth',
    baseURL: process.env.BETTER_AUTH_URL || `http://localhost:${process.env.PORT || 3001}`,
    database: drizzleAdapter(db, {
        provider: 'pg',
        schema,
    }),
    secret: process.env.AUTH_SECRET,
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
    },
    user: {
        additionalFields: {
            role: {
                type: 'string',
                required: false,
                defaultValue: '',
                input: true,
            },
            status: {
                type: 'string',
                required: false,
                defaultValue: 'Pending',
                input: false,
            },
        },
    },
    databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    // Auto-promote the first user ever to Admin
                    const [result] = await db.select({ total: count() }).from(userTable);
                    if (result && result.total === 1) {
                        await db
                            .update(userTable)
                            .set({ role: 'Admin', status: 'Active', updatedAt: new Date() })
                            .where(eq(userTable.id, user.id));
                    }
                },
            },
        },
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // Update session age every 24 hours
        cookieCache: {
            enabled: true,
            maxAge: 60 * 5, // 5 minutes
        },
    },
    advanced: {
        crossSubDomainCookies: {
            enabled: true,
        },
        defaultCookieAttributes: {
            sameSite: 'none',
            secure: true,
        },
    },
    trustedOrigins: [
        process.env.CORS_ORIGIN || 'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
    ],
});
