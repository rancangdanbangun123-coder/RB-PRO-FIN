import { Hono } from 'hono';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import { materialsService } from '../services/materials.service.js';

const app = new Hono();
app.use('/*', requireAuth);

app.get('/', requirePermission('view_logistik'), async (c) => {
    const mats = await materialsService.findAll();
    return c.json(mats);
});

app.get('/:id', requirePermission('view_logistik'), async (c) => {
    const mat = await materialsService.findById(c.req.param('id'));
    if (!mat) return c.json({ error: 'Material not found' }, 404);
    return c.json(mat);
});

app.post('/', requirePermission('create_material'), async (c) => {
    const body = await c.req.json();
    const created = await materialsService.create(body);
    return c.json(created, 201);
});

app.put('/:id', requirePermission('edit_material'), async (c) => {
    const body = await c.req.json();
    const updated = await materialsService.update(c.req.param('id'), body);
    if (!updated) return c.json({ error: 'Material not found' }, 404);
    return c.json(updated);
});

app.delete('/:id', requirePermission('delete_material'), async (c) => {
    const deleted = await materialsService.remove(c.req.param('id'));
    if (!deleted) return c.json({ error: 'Material not found' }, 404);
    return c.json({ success: true });
});

app.post('/import', requirePermission('import_material'), async (c) => {
    const { items } = await c.req.json();
    const result = await materialsService.bulkImport(items);
    return c.json(result, 201);
});

export default app;
