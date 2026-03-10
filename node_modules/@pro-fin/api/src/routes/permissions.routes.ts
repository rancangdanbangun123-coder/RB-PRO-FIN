import { Hono } from 'hono';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import { permissionsService } from '../services/permissions.service.js';
import { ALL_PERMISSION_KEYS } from '../constants/permissions.js';

const app = new Hono();
app.use('/*', requireAuth);

// GET /roles — List all roles with permissions
app.get('/roles', requirePermission('manage_roles'), async (c) => {
    const roles = await permissionsService.findAllRoles();
    return c.json(roles);
});

// POST /roles — Create custom role
app.post('/roles', requirePermission('manage_roles'), async (c) => {
    const body = await c.req.json();
    const role = await permissionsService.createRole(body);
    return c.json(role, 201);
});

// PUT /roles/:id — Update role permissions
app.put('/roles/:id', requirePermission('manage_roles'), async (c) => {
    const { permissions } = await c.req.json();
    const updated = await permissionsService.updateRolePermissions(c.req.param('id'), permissions);
    return c.json(updated);
});

// DELETE /roles/:id — Delete custom role
app.delete('/roles/:id', requirePermission('manage_roles'), async (c) => {
    const deleted = await permissionsService.deleteRole(c.req.param('id'));
    if (!deleted) return c.json({ error: 'Role not found' }, 404);
    return c.json({ success: true });
});

// GET /keys — List all available permission keys
app.get('/keys', requirePermission('manage_roles'), async (c) => {
    return c.json(ALL_PERMISSION_KEYS);
});

export default app;
