import { serve } from '@hono/node-server';
import app from './app.js';
import 'dotenv/config';

const port = Number(process.env.PORT) || 3001;

console.log(`🚀 Pro-Fin API starting on port ${port}...`);

serve({
    fetch: app.fetch,
    port,
}, (info) => {
    console.log(`✅ Server running at http://localhost:${info.port}`);
    console.log(`📋 Health check: http://localhost:${info.port}/health`);
    console.log(`🔐 Auth endpoint: http://localhost:${info.port}/api/auth`);
    console.log(`📦 API base: http://localhost:${info.port}/api/v1`);
});
