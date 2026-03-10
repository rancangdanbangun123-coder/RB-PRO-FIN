import { Hono } from 'hono';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import { assetsService } from '../services/assets.service.js';

const app = new Hono();
app.use('/*', requireAuth);

app.get('/', async (c) => {
    const list = await assetsService.findAll();
    return c.json(list);
});

app.get('/requests', async (c) => {
    const requests = await assetsService.findAllRequests();
    return c.json(requests);
});

app.get('/:id', async (c) => {
    const asset = await assetsService.findById(c.req.param('id'));
    if (!asset) return c.json({ error: 'Asset not found' }, 404);
    return c.json(asset);
});

app.post('/', requirePermission('create_asset'), async (c) => {
    const body = await c.req.json();
    const created = await assetsService.create(body);
    return c.json(created, 201);
});

app.put('/:id', requirePermission('edit_asset'), async (c) => {
    const body = await c.req.json();
    const updated = await assetsService.update(c.req.param('id'), body);
    if (!updated) return c.json({ error: 'Asset not found' }, 404);
    return c.json(updated);
});

app.delete('/:id', requirePermission('delete_asset'), async (c) => {
    const deleted = await assetsService.remove(c.req.param('id'));
    if (!deleted) return c.json({ error: 'Asset not found' }, 404);
    return c.json({ success: true });
});

app.post('/requests', requirePermission('create_asset'), async (c) => {
    const body = await c.req.json();
    const created = await assetsService.createRequest(body);
    return c.json(created, 201);
});

app.put('/requests/:id/status', requirePermission('edit_asset'), async (c) => {
    const { status, note } = await c.req.json();
    const user = c.get('user');
    const updated = await assetsService.updateRequestStatus(c.req.param('id'), status, user.name, note);
    if (!updated) return c.json({ error: 'Request not found' }, 404);
    return c.json(updated);
});

export default app;
