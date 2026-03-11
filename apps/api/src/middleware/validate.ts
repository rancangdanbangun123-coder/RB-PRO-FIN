import { zValidator } from '@hono/zod-validator';
import type { ZodSchema } from 'zod';

// Re-export zValidator for convenience — used in route files like:
// app.post('/', zValidator('json', createProjectSchema), async (c) => { ... })
export { zValidator };

// Helper to validate JSON body
export function validateBody<T extends ZodSchema>(schema: T) {
    return zValidator('json', schema as any);
}

// Helper to validate query params
export function validateQuery<T extends ZodSchema>(schema: T) {
    return zValidator('query', schema as any);
}

// Helper to validate route params
export function validateParam<T extends ZodSchema>(schema: T) {
    return zValidator('param', schema as any);
}
