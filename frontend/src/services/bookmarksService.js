import { apiCall } from './api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const bookmarksService = {
    // Obtener todos los marcadores
    getAll: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiCall(`/links${queryString ? '?' + queryString : ''}`);
    },

    // Obtener un marcador por ID
    getById: (id) => apiCall(`/links/${id}`),

    // Hacer web scraping de una URL
    scrapeUrl: (url) => {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
        };
        
        return fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3000/api'}/links/scrape`, {
            method: 'POST',
            body: JSON.stringify({ url }),
            headers
        }).then(res => {
            if (!res.ok) {
                throw new Error(`Error ${res.status}: ${res.statusText}`);
            }
            return res.json();
        });
    },

    // Crear un nuevo marcador
    create: (bookmarkData) => {
        // Si hay archivo, usar FormData para enviar la imagen
        if (bookmarkData instanceof FormData) {
            const headers = getAuthHeaders();
            return fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3000/api'}/links`, {
                method: 'POST',
                body: bookmarkData,
                headers
            }).then(res => {
                if (!res.ok) {
                    throw new Error(`Error ${res.status}: ${res.statusText}`);
                }
                return res.json();
            }).then(data => {
                if (!data || !data.id) {
                    throw new Error('Respuesta inválida del servidor');
                }
                return data;
            });
        }
        
        return apiCall('/links', {
            method: 'POST',
            body: JSON.stringify(bookmarkData),
            headers: {
                'Content-Type': 'application/json'
            }
        });
    },

    // Actualizar un marcador
    update: (id, bookmarkData) => {
        // Si hay archivo, usar FormData para enviar la imagen
        if (bookmarkData instanceof FormData) {
            const headers = getAuthHeaders();
            return fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3000/api'}/links/${id}`, {
                method: 'PUT',
                body: bookmarkData,
                headers
            }).then(res => res.json());
        }
        
        return apiCall(`/links/${id}`, {
            method: 'PUT',
            body: JSON.stringify(bookmarkData),
            headers: {
                'Content-Type': 'application/json'
            }
        });
    },

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

    // Obtener los últimos 10 marcadores más recientemente abiertos
    getRecentBookmarks: () => apiCall('/links/stats/recent'),

    // Contar todos los marcadores (incluyendo los de carpetas)
    countAllBookmarks: () => apiCall('/links/stats/count-all'),

    // Contar marcadores visitados en última semana
    countVisitedLastWeek: () => apiCall('/links/stats/count-last-week'),

    // Actualizar datos de GitHub de todos los marcadores
    refreshGitHubData: () => {
        return fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3000/api'}/links/refresh-github`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => {
            if (!res.ok) {
                throw new Error(`Error ${res.status}: ${res.statusText}`);
            }
            return res.json();
        });
    }
};
