import { Hono } from 'hono';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import { projectsService } from '../services/projects.service.js';

const app = new Hono();
app.use('/*', requireAuth);

// GET / — List projects (filtered by role)
app.get('/', requirePermission('view_proyek'), async (c) => {
    const user = c.get('user');
    const permissions = c.get('permissions');
    const canViewAll = permissions.includes('view_all_projects');
    const projects = await projectsService.findAll(user.id, canViewAll);
    return c.json(projects);
});

// GET /:id — Get project detail
app.get('/:id', requirePermission('view_proyek'), async (c) => {
    const project = await projectsService.findById(c.req.param('id'));
    if (!project) return c.json({ error: 'Project not found' }, 404);
    return c.json(project);
});

// POST / — Create project
app.post('/', requirePermission('create_proyek'), async (c) => {
    const body = await c.req.json();
    const created = await projectsService.create(body);
    return c.json(created, 201);
});

// PUT /:id — Update project
app.put('/:id', requirePermission('edit_proyek'), async (c) => {
    const body = await c.req.json();
    const updated = await projectsService.update(c.req.param('id'), body);
    if (!updated) return c.json({ error: 'Project not found' }, 404);
    return c.json(updated);
});

// PUT /:id/progress — Update progress
app.put('/:id/progress', requirePermission('edit_proyek'), async (c) => {
    const { progress } = await c.req.json();
    const updated = await projectsService.updateProgress(c.req.param('id'), progress);
    if (!updated) return c.json({ error: 'Project not found' }, 404);
    return c.json(updated);
});

// DELETE /:id — Delete project
app.delete('/:id', requirePermission('delete_proyek'), async (c) => {
    const deleted = await projectsService.remove(c.req.param('id'));
    if (!deleted) return c.json({ error: 'Project not found' }, 404);
    return c.json({ success: true });
});

export default app;
