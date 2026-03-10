import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { requireAuth, requirePermission, requireAnyPermission } from '../middleware/auth.js';
import { procurementService } from '../services/procurement.service.js';

const app = new Hono();
app.use('/*', requireAuth);

// GET / — All items (Kanban board data)
app.get('/', async (c) => {
    const items = await procurementService.findAll();
    return c.json(items);
});

// GET /:id — Item detail with transitions
app.get('/:id', async (c) => {
    const item = await procurementService.findById(c.req.param('id'));
    if (!item) return c.json({ error: 'Item not found' }, 404);
    return c.json(item);
});

// POST / — Create PR
app.post('/', requirePermission('create_procurement'), async (c) => {
    const body = await c.req.json();
    const user = c.get('user');
    const created = await procurementService.create({ ...body, createdBy: user.id });
    return c.json(created, 201);
});

// PUT /:id — Update item (edit_procurement OR edit_own_procurement)
app.put('/:id', requireAnyPermission('edit_procurement', 'edit_own_procurement'), async (c) => {
    const user = c.get('user');
    const permissions = c.get('permissions');
    const id = c.req.param('id');

    // If only has edit_own, check ownership
    if (!permissions.includes('edit_procurement')) {
        const isOwner = await procurementService.isOwnedBy(id, user.id);
        if (!isOwner) throw new HTTPException(403, { message: 'Can only edit own procurement items' });
    }

    const body = await c.req.json();
    const updated = await procurementService.update(id, body);
    if (!updated) return c.json({ error: 'Item not found' }, 404);
    return c.json(updated);
});

// PUT /:id/transition — Move between stages
app.put('/:id/transition', requirePermission('move_procurement'), async (c) => {
    const { fromStage, toStage, formData } = await c.req.json();
    const user = c.get('user');
    const permissions = c.get('permissions');

    // PR→PO transition requires approve_pr permission
    if (fromStage === 'pr' && toStage === 'po' && !permissions.includes('approve_pr')) {
        throw new HTTPException(403, { message: 'PR approval permission required' });
    }

    const updated = await procurementService.transition(c.req.param('id'), fromStage, toStage, formData || {}, user.id);
    if (!updated) return c.json({ error: 'Item not found' }, 404);
    return c.json(updated);
});

// PUT /:id/reorder — Reorder within column
app.put('/:id/reorder', requireAnyPermission('edit_procurement', 'edit_own_procurement'), async (c) => {
    const { sortOrder } = await c.req.json();
    const updated = await procurementService.reorder(c.req.param('id'), sortOrder);
    if (!updated) return c.json({ error: 'Item not found' }, 404);
    return c.json(updated);
});

// DELETE /:id
app.delete('/:id', requireAnyPermission('delete_procurement', 'delete_own_procurement'), async (c) => {
    const user = c.get('user');
    const permissions = c.get('permissions');
    const id = c.req.param('id');

    if (!permissions.includes('delete_procurement')) {
        const isOwner = await procurementService.isOwnedBy(id, user.id);
        if (!isOwner) throw new HTTPException(403, { message: 'Can only delete own procurement items' });
    }

    const deleted = await procurementService.remove(id);
    if (!deleted) return c.json({ error: 'Item not found' }, 404);
    return c.json({ success: true });
});

export default app;
