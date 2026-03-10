// Central API client for all backend requests
const API_BASE = 'http://localhost:3001/api/v1';

async function request(endpoint, options = {}) {
    const { method = 'GET', body, params } = options;

    let url = `${API_BASE}${endpoint}`;
    if (params) {
        const qs = new URLSearchParams(params).toString();
        url += `?${qs}`;
    }

    const config = {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Send Better Auth session cookie
    };

    if (body && method !== 'GET') {
        config.body = JSON.stringify(body);
    }

    const res = await fetch(url, config);

    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || `API error: ${res.status}`);
    }

    return res.json();
}

// ── Convenience methods ──
export const api = {
    get: (endpoint, params) => request(endpoint, { method: 'GET', params }),
    post: (endpoint, body) => request(endpoint, { method: 'POST', body }),
    put: (endpoint, body) => request(endpoint, { method: 'PUT', body }),
    delete: (endpoint) => request(endpoint, { method: 'DELETE' }),

    // ── Module shortcuts ──
    users: {
        list: () => api.get('/users'),
        get: (id) => api.get(`/users/${id}`),
        create: (data) => api.post('/users', data),
        update: (id, data) => api.put(`/users/${id}`, data),
        remove: (id) => api.delete(`/users/${id}`),
        activate: (id, role) => api.put(`/users/${id}/activate`, { role }),
        updateProfile: (data) => api.put('/users/profile', data),
    },
    permissions: {
        listRoles: () => api.get('/permissions/roles'),
        createRole: (data) => api.post('/permissions/roles', data),
        updateRole: (id, permissions) => api.put(`/permissions/roles/${id}`, { permissions }),
        deleteRole: (id) => api.delete(`/permissions/roles/${id}`),
        listKeys: () => api.get('/permissions/keys'),
    },
    projects: {
        list: () => api.get('/projects'),
        get: (id) => api.get(`/projects/${id}`),
        create: (data) => api.post('/projects', data),
        update: (id, data) => api.put(`/projects/${id}`, data),
        updateProgress: (id, progress) => api.put(`/projects/${id}/progress`, { progress }),
        remove: (id) => api.delete(`/projects/${id}`),
        // Budgets
        listBudgets: (pid) => api.get(`/projects/${pid}/budgets`),
        createBudget: (pid, data) => api.post(`/projects/${pid}/budgets`, data),
        bulkCreateBudgets: (pid, items) => api.post(`/projects/${pid}/budgets/bulk`, { items }),
        updateBudget: (pid, id, data) => api.put(`/projects/${pid}/budgets/${id}`, data),
        removeBudget: (pid, id) => api.delete(`/projects/${pid}/budgets/${id}`),
    },
    transactions: {
        list: (projectId) => api.get('/transactions', projectId ? { projectId } : undefined),
        get: (id) => api.get(`/transactions/${id}`),
        create: (data) => api.post('/transactions', data),
        update: (id, data) => api.put(`/transactions/${id}`, data),
        remove: (id) => api.delete(`/transactions/${id}`),
    },
    categories: {
        list: () => api.get('/categories'),
        create: (data) => api.post('/categories', data),
        update: (id, data) => api.put(`/categories/${id}`, data),
        remove: (id, migrateTo) => api.delete(migrateTo ? `/categories/${id}?migrateTo=${migrateTo}` : `/categories/${id}`),
        createSub: (catId, data) => api.post(`/categories/${catId}/subcategories`, data),
        updateSub: (id, data) => api.put(`/categories/subcategories/${id}`, data),
        removeSub: (id, migrateTo) => api.delete(migrateTo ? `/categories/subcategories/${id}?migrateTo=${migrateTo}` : `/categories/subcategories/${id}`),
        import: (items) => api.post('/categories/import', { items }),
    },
    materials: {
        list: () => api.get('/materials'),
        get: (id) => api.get(`/materials/${id}`),
        create: (data) => api.post('/materials', data),
        update: (id, data) => api.put(`/materials/${id}`, data),
        remove: (id) => api.delete(`/materials/${id}`),
        import: (items) => api.post('/materials/import', { items }),
    },
    subcontractors: {
        list: () => api.get('/subcontractors'),
        get: (id) => api.get(`/subcontractors/${id}`),
        create: (data) => api.post('/subcontractors', data),
        update: (id, data) => api.put(`/subcontractors/${id}`, data),
        approve: (id, status) => api.put(`/subcontractors/${id}/approve`, { status }),
        remove: (id) => api.delete(`/subcontractors/${id}`),
        addMaterial: (id, data) => api.post(`/subcontractors/${id}/materials`, data),
        updateMaterial: (id, matId, data) => api.put(`/subcontractors/${id}/materials/${matId}`, data),
        removeMaterial: (id, matId) => api.delete(`/subcontractors/${id}/materials/${matId}`),
    },
    assets: {
        list: () => api.get('/assets'),
        get: (id) => api.get(`/assets/${id}`),
        create: (data) => api.post('/assets', data),
        update: (id, data) => api.put(`/assets/${id}`, data),
        remove: (id) => api.delete(`/assets/${id}`),
        listRequests: () => api.get('/assets/requests'),
        createRequest: (data) => api.post('/assets/requests', data),
        updateRequestStatus: (id, status, note) => api.put(`/assets/requests/${id}/status`, { status, note }),
    },
    procurement: {
        list: () => api.get('/procurement'),
        get: (id) => api.get(`/procurement/${id}`),
        create: (data) => api.post('/procurement', data),
        update: (id, data) => api.put(`/procurement/${id}`, data),
        transition: (id, fromStage, toStage, formData) =>
            api.put(`/procurement/${id}/transition`, { fromStage, toStage, formData }),
        reorder: (id, sortOrder) => api.put(`/procurement/${id}/reorder`, { sortOrder }),
        remove: (id) => api.delete(`/procurement/${id}`),
    },
    invoices: {
        listClients: () => api.get('/invoices/clients'),
        createClient: (data) => api.post('/invoices/clients', data),
        updateClient: (id, data) => api.put(`/invoices/clients/${id}`, data),
        removeClient: (id) => api.delete(`/invoices/clients/${id}`),
        listBilling: (pid) => api.get(`/invoices/projects/${pid}/billing`),
        createBillingStep: (pid, data) => api.post(`/invoices/projects/${pid}/billing/steps`, data),
        updateBillingStep: (id, data) => api.put(`/invoices/billing/steps/${id}`, data),
        removeBillingStep: (id) => api.delete(`/invoices/billing/steps/${id}`),
        createPaymentLog: (pid, data) => api.post(`/invoices/projects/${pid}/billing/logs`, data),
        updatePaymentLog: (id, data) => api.put(`/invoices/billing/logs/${id}`, data),
        removePaymentLog: (id) => api.delete(`/invoices/billing/logs/${id}`),
    },
    locations: {
        listProvinsi: () => api.get('/locations/provinsi'),
        listKabupaten: (provinsiId) => api.get(`/locations/provinsi/${provinsiId}/kabupaten`),
        listKecamatan: (kabupatenId) => api.get(`/locations/kabupaten/${kabupatenId}/kecamatan`),
    },
};
