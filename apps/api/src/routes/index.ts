import { Hono } from 'hono';
import usersRoutes from './users.routes.js';
import permissionsRoutes from './permissions.routes.js';
import projectsRoutes from './projects.routes.js';
import budgetsRoutes from './budgets.routes.js';
import transactionsRoutes from './transactions.routes.js';
import categoriesRoutes from './categories.routes.js';
import materialsRoutes from './materials.routes.js';
import subcontractorsRoutes from './subcontractors.routes.js';
import assetsRoutes from './assets.routes.js';
import procurementRoutes from './procurement.routes.js';
import invoicesRoutes from './invoices.routes.js';
import locationsRoutes from './locations.routes.js';

export const routes = new Hono();

routes.route('/users', usersRoutes);
routes.route('/permissions', permissionsRoutes);
routes.route('/projects', projectsRoutes);
routes.route('/projects', budgetsRoutes); // nested: /projects/:projectId/budgets
routes.route('/transactions', transactionsRoutes);
routes.route('/categories', categoriesRoutes);
routes.route('/materials', materialsRoutes);
routes.route('/subcontractors', subcontractorsRoutes);
routes.route('/assets', assetsRoutes);
routes.route('/procurement', procurementRoutes);
routes.route('/invoices', invoicesRoutes);
routes.route('/locations', locationsRoutes);
