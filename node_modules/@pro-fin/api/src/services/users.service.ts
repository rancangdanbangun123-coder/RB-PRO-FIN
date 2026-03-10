import { db } from '../db/index.js';
import { user } from '../db/schema/index.js';
import { eq } from 'drizzle-orm';

export const usersService = {
    async findAll() {
        return db.select().from(user);
    },

    async findById(id: string) {
        const [found] = await db.select().from(user).where(eq(user.id, id));
        return found || null;
    },

    async update(id: string, data: { name?: string; role?: string; status?: string; image?: string }) {
        const [updated] = await db
            .update(user)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(user.id, id))
            .returning();
        return updated;
    },

    async remove(id: string) {
        const [deleted] = await db.delete(user).where(eq(user.id, id)).returning();
        return deleted;
    },
};
