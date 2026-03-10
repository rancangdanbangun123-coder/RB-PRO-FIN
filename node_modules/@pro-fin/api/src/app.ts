import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { HTTPException } from 'hono/http-exception';
import { auth } from './auth/index.js';
import { routes } from './routes/index.js';

const app = new Hono();

// ── Global Middleware ──
app.use('*', logger());
app.use('*', secureHeaders());
app.use(
    '*',
    cors({
        origin: (origin) => {
            const allowed = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map(s => s.trim());
            // Also allow any localhost port for development
            if (origin && origin.match(/^http:\/\/localhost:\d+$/)) return origin;
            return allowed.includes(origin) ? origin : allowed[0];
        },
        credentials: true,
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowHeaders: ['Content-Type', 'Authorization'],
    })
);

// ── Better Auth handler ──
app.all('/api/auth/*', (c) => {
    return auth.handler(c.req.raw);
});

// ── API Routes ──
app.route('/api/v1', routes);

// ── Health Check ──
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── Global Error Handler ──
app.onError((err, c) => {
    if (err instanceof HTTPException) {
        return c.json({ error: err.message }, err.status);
    }
    console.error('Unhandled error:', err);
    return c.json({ error: 'Internal server error' }, 500);
});

// ── 404 ──
app.notFound((c) => c.json({ error: 'Not found' }, 404));

export default app;
