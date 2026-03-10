import { Hono } from 'hono';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import { subcontractorsService } from '../services/subcontractors.service.js';

const app = new Hono();
app.use('/*', requireAuth);

app.get('/', async (c) => {
    const subcons = await subcontractorsService.findAll();
    return c.json(subcons);
});

app.get('/:id', async (c) => {
    const subcon = await subcontractorsService.findById(c.req.param('id'));
    if (!subcon) return c.json({ error: 'Subcontractor not found' }, 404);
    return c.json(subcon);
});

app.post('/', requirePermission('create_subcon'), async (c) => {
    const body = await c.req.json();
    const created = await subcontractorsService.create(body);
    return c.json(created, 201);
});

app.put('/:id', requirePermission('edit_subcon'), async (c) => {
    const body = await c.req.json();
    const updated = await subcontractorsService.update(c.req.param('id'), body);
    if (!updated) return c.json({ error: 'Subcontractor not found' }, 404);
    return c.json(updated);
});

app.put('/:id/approve', requirePermission('edit_subcon'), async (c) => {
    const { status } = await c.req.json();
    const updated = await subcontractorsService.updateStatus(c.req.param('id'), status);
    if (!updated) return c.json({ error: 'Subcontractor not found' }, 404);
    return c.json(updated);
});

app.delete('/:id', requirePermission('delete_subcon'), async (c) => {
    const deleted = await subcontractorsService.remove(c.req.param('id'));
    if (!deleted) return c.json({ error: 'Subcontractor not found' }, 404);
    return c.json({ success: true });
});

// Supplied materials
app.post('/:id/materials', requirePermission('edit_subcon'), async (c) => {
    const body = await c.req.json();
    const created = await subcontractorsService.addMaterial({ ...body, subcontractorId: c.req.param('id') });
    return c.json(created, 201);
});

app.put('/:id/materials/:matId', requirePermission('edit_subcon'), async (c) => {
    const body = await c.req.json();
    const updated = await subcontractorsService.updateMaterial(c.req.param('matId'), body);
    if (!updated) return c.json({ error: 'Supply material not found' }, 404);
    return c.json(updated);
});

app.delete('/:id/materials/:matId', requirePermission('edit_subcon'), async (c) => {
    const deleted = await subcontractorsService.removeMaterial(c.req.param('matId'));
    if (!deleted) return c.json({ error: 'Supply material not found' }, 404);
    return c.json({ success: true });
});

export default app;
