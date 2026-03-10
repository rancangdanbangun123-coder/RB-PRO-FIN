import { Hono } from 'hono';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import { transactionsService } from '../services/transactions.service.js';

const app = new Hono();
app.use('/*', requireAuth);

app.get('/', requirePermission('view_akuntansi'), async (c) => {
    const projectId = c.req.query('projectId');
    const txns = await transactionsService.findAll(projectId);
    return c.json(txns);
});

app.get('/:id', requirePermission('view_akuntansi'), async (c) => {
    const txn = await transactionsService.findById(c.req.param('id'));
    if (!txn) return c.json({ error: 'Transaction not found' }, 404);
    return c.json(txn);
});

app.post('/', requirePermission('view_akuntansi'), async (c) => {
    const { items, ...data } = await c.req.json();
    const user = c.get('user');
    const created = await transactionsService.create({ ...data, createdBy: user.id }, items);
    return c.json(created, 201);
});

app.put('/:id', requirePermission('view_akuntansi'), async (c) => {
    const body = await c.req.json();
    const updated = await transactionsService.update(c.req.param('id'), body);
    if (!updated) return c.json({ error: 'Transaction not found' }, 404);
    return c.json(updated);
});

app.delete('/:id', requirePermission('view_akuntansi'), async (c) => {
    const deleted = await transactionsService.remove(c.req.param('id'));
    if (!deleted) return c.json({ error: 'Transaction not found' }, 404);
    return c.json({ success: true });
});

export default app;
