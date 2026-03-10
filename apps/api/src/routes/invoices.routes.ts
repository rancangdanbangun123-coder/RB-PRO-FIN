import { Hono } from 'hono';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import { invoicesService } from '../services/invoices.service.js';

const app = new Hono();
app.use('/*', requireAuth);

// ── Clients ──
app.get('/clients', requirePermission('view_keuangan'), async (c) => {
    const list = await invoicesService.findAllClients();
    return c.json(list);
});

app.post('/clients', requirePermission('create_invoice'), async (c) => {
    const body = await c.req.json();
    const created = await invoicesService.createClient(body);
    return c.json(created, 201);
});

app.put('/clients/:id', requirePermission('edit_invoice'), async (c) => {
    const body = await c.req.json();
    const updated = await invoicesService.updateClient(c.req.param('id'), body);
    if (!updated) return c.json({ error: 'Client not found' }, 404);
    return c.json(updated);
});

app.delete('/clients/:id', requirePermission('delete_invoice'), async (c) => {
    const deleted = await invoicesService.removeClient(c.req.param('id'));
    if (!deleted) return c.json({ error: 'Client not found' }, 404);
    return c.json({ success: true });
});

// ── Billing Steps ──
app.get('/projects/:pid/billing', requirePermission('view_keuangan'), async (c) => {
    const steps = await invoicesService.findBillingByProject(c.req.param('pid'));
    return c.json(steps);
});

app.post('/projects/:pid/billing/steps', requirePermission('create_invoice'), async (c) => {
    const body = await c.req.json();
    const created = await invoicesService.createBillingStep({ ...body, projectId: c.req.param('pid') });
    return c.json(created, 201);
});

app.put('/billing/steps/:id', requirePermission('edit_invoice'), async (c) => {
    const body = await c.req.json();
    const updated = await invoicesService.updateBillingStep(c.req.param('id'), body);
    if (!updated) return c.json({ error: 'Billing step not found' }, 404);
    return c.json(updated);
});

app.delete('/billing/steps/:id', requirePermission('delete_invoice'), async (c) => {
    const deleted = await invoicesService.removeBillingStep(c.req.param('id'));
    if (!deleted) return c.json({ error: 'Billing step not found' }, 404);
    return c.json({ success: true });
});

// ── Payment Logs ──
app.post('/projects/:pid/billing/logs', requirePermission('create_invoice'), async (c) => {
    const body = await c.req.json();
    const created = await invoicesService.createPaymentLog({ ...body, projectId: c.req.param('pid') });
    return c.json(created, 201);
});

app.put('/billing/logs/:id', requirePermission('edit_invoice'), async (c) => {
    const body = await c.req.json();
    const updated = await invoicesService.updatePaymentLog(c.req.param('id'), body);
    if (!updated) return c.json({ error: 'Payment log not found' }, 404);
    return c.json(updated);
});

app.delete('/billing/logs/:id', requirePermission('delete_invoice'), async (c) => {
    const deleted = await invoicesService.removePaymentLog(c.req.param('id'));
    if (!deleted) return c.json({ error: 'Payment log not found' }, 404);
    return c.json({ success: true });
});

export default app;
