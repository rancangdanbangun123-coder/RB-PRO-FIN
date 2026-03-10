import { Hono } from 'hono';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import { categoriesService } from '../services/categories.service.js';

const app = new Hono();
app.use('/*', requireAuth);

app.get('/', requirePermission('view_category'), async (c) => {
    const cats = await categoriesService.findAll();
    return c.json(cats);
});

app.post('/', requirePermission('create_category'), async (c) => {
    const body = await c.req.json();
    const created = await categoriesService.create(body);
    return c.json(created, 201);
});

app.put('/:id', requirePermission('create_category'), async (c) => {
    const body = await c.req.json();
    const updated = await categoriesService.update(c.req.param('id'), body);
    if (!updated) return c.json({ error: 'Category not found' }, 404);
    return c.json(updated);
});

app.delete('/:id', requirePermission('delete_category'), async (c) => {
    const migrateTo = c.req.query('migrateTo');
    const deleted = await categoriesService.remove(c.req.param('id'), migrateTo);
    if (!deleted) return c.json({ error: 'Category not found' }, 404);
    return c.json({ success: true });
});

// Sub-categories
app.post('/:id/subcategories', requirePermission('create_category'), async (c) => {
    const body = await c.req.json();
    const created = await categoriesService.createSubCategory({ ...body, categoryId: c.req.param('id') });
    return c.json(created, 201);
});

app.put('/subcategories/:id', requirePermission('create_category'), async (c) => {
    const body = await c.req.json();
    const updated = await categoriesService.updateSubCategory(c.req.param('id'), body);
    if (!updated) return c.json({ error: 'Sub-category not found' }, 404);
    return c.json(updated);
});

app.delete('/subcategories/:id', requirePermission('delete_category'), async (c) => {
    const migrateTo = c.req.query('migrateTo');
    const deleted = await categoriesService.removeSubCategory(c.req.param('id'), migrateTo);
    if (!deleted) return c.json({ error: 'Sub-category not found' }, 404);
    return c.json({ success: true });
});

app.post('/import', requirePermission('import_category'), async (c) => {
    const { items } = await c.req.json();
    const result = await categoriesService.bulkImport(items);
    return c.json(result, 201);
});

export default app;
