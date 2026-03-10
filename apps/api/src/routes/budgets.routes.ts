import { Hono } from 'hono';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import { budgetsService } from '../services/budgets.service.js';

const app = new Hono();
app.use('/*', requireAuth);

// GET /:projectId/budgets — List project budgets
app.get('/:projectId/budgets', requirePermission('view_proyek'), async (c) => {
    const budgets = await budgetsService.findByProject(c.req.param('projectId'));
    return c.json(budgets);
});

// POST /:projectId/budgets — Add budget item
app.post('/:projectId/budgets', requirePermission('edit_proyek'), async (c) => {
    const body = await c.req.json();
    const created = await budgetsService.create({ ...body, projectId: c.req.param('projectId') });
    return c.json(created, 201);
});

// POST /:projectId/budgets/bulk — Bulk import
app.post('/:projectId/budgets/bulk', requirePermission('edit_proyek'), async (c) => {
    const { items } = await c.req.json();
    const projectId = c.req.param('projectId');
    const created = await budgetsService.bulkCreate(items.map((i: any) => ({ ...i, projectId })));
    return c.json(created, 201);
});

// PUT /:projectId/budgets/:id — Update budget item
app.put('/:projectId/budgets/:id', requirePermission('edit_proyek'), async (c) => {
    const body = await c.req.json();
    const updated = await budgetsService.update(c.req.param('id'), body);
    if (!updated) return c.json({ error: 'Budget item not found' }, 404);
    return c.json(updated);
});

// DELETE /:projectId/budgets/:id — Delete budget item
app.delete('/:projectId/budgets/:id', requirePermission('edit_proyek'), async (c) => {
    const deleted = await budgetsService.remove(c.req.param('id'));
    if (!deleted) return c.json({ error: 'Budget item not found' }, 404);
    return c.json({ success: true });
});

export default app;
