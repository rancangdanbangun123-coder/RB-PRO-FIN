import { Hono } from 'hono';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import { usersService } from '../services/users.service.js';

const app = new Hono();
app.use('/*', requireAuth);

// GET / — List all users
app.get('/', requirePermission('view_users'), async (c) => {
    const users = await usersService.findAll();
    return c.json(users);
});

// GET /:id — Get user by ID
app.get('/:id', requirePermission('view_users'), async (c) => {
    const user = await usersService.findById(c.req.param('id'));
    if (!user) return c.json({ error: 'User not found' }, 404);
    return c.json(user);
});

// PUT /:id — Update user
app.put('/:id', requirePermission('edit_user'), async (c) => {
    const body = await c.req.json();
    const updated = await usersService.update(c.req.param('id'), body);
    if (!updated) return c.json({ error: 'User not found' }, 404);
    return c.json(updated);
});

// DELETE /:id — Delete user
app.delete('/:id', requirePermission('delete_user'), async (c) => {
    const deleted = await usersService.remove(c.req.param('id'));
    if (!deleted) return c.json({ error: 'User not found' }, 404);
    return c.json({ success: true });
});

// PUT /:id/activate — Admin activates a pending user by assigning role
app.put('/:id/activate', requirePermission('approve_user'), async (c) => {
    const { role } = await c.req.json();
    if (!role) return c.json({ error: 'Role is required' }, 400);
    const updated = await usersService.update(c.req.param('id'), { role, status: 'Active' });
    if (!updated) return c.json({ error: 'User not found' }, 404);
    return c.json(updated);
});

// PUT /profile — Update current logged in user's profile
app.put('/profile', async (c) => {
    // BetterAuth injects into c.get('session') or c.get('user')
    const session = c.get('session' as any) as any;
    const user = c.get('user' as any) as any || session?.user;

    if (!user?.id) return c.json({ error: 'Unauthorized' }, 401);

    const { name, image } = await c.req.json();
    if (!name?.trim()) return c.json({ error: 'Name is required' }, 400);

    const updated = await usersService.update(user.id, { name: name.trim(), image });
    if (!updated) return c.json({ error: 'User not found' }, 404);

    return c.json(updated);
});

export default app;
