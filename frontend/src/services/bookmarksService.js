import { apiCall } from './api';

export const bookmarksService = {
    // Obtener todos los marcadores
    getAll: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiCall(`/links${queryString ? '?' + queryString : ''}`);
    },

    // Obtener un marcador por ID
    getById: (id) => apiCall(`/links/${id}`),

    // Crear un nuevo marcador
    create: (bookmarkData) =>
        apiCall('/links', {
            method: 'POST',
            body: bookmarkData
        }),

    // Actualizar un marcador
    update: (id, bookmarkData) =>
        apiCall(`/links/${id}`, {
            method: 'PUT',
            body: bookmarkData
        }),

    // Eliminar un marcador
    delete: (id) =>
        apiCall(`/links/${id}`, {
            method: 'DELETE'
        }),

    // Obtener marcadores por tag
    getByTag: (tagId, params = {}) => {
        const queryString = new URLSearchParams({ tag_id: tagId, ...params }).toString();
        return apiCall(`/links?${queryString}`);
    },

    // Obtener marcadores por categoría
    getByCategory: (categoryId, params = {}) => {
        const queryString = new URLSearchParams({ categoria_id: categoryId, ...params }).toString();
        return apiCall(`/links?${queryString}`);
    },

    // Registrar que se abrió un marcador
    recordAccess: (id) =>
        apiCall(`/links/${id}/access`, {
            method: 'POST'
        }),

    // Obtener marcadores visitados en última semana
    getVisitedLastWeek: () => apiCall('/links/stats/last-week'),

    // Contar marcadores visitados en última semana
    countVisitedLastWeek: () => apiCall('/links/stats/count-last-week')
};

