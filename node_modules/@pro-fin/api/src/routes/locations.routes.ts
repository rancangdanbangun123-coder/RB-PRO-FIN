import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth.js';
import { locationsService } from '../services/locations.service.js';

const app = new Hono();
app.use('/*', requireAuth);

app.get('/provinsi', async (c) => {
    const list = await locationsService.findAllProvinsi();
    return c.json(list);
});

app.get('/provinsi/:id/kabupaten', async (c) => {
    const list = await locationsService.findKabupatenByProvinsi(c.req.param('id'));
    return c.json(list);
});

app.get('/kabupaten/:id/kecamatan', async (c) => {
    const list = await locationsService.findKecamatanByKabupaten(c.req.param('id'));
    return c.json(list);
});

export default app;
