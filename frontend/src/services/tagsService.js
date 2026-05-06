import { apiCall } from './api';

export const tagsService = {
    // Obtener todos los tags
    getAll: () => apiCall('/tags'),

    // Obtener un tag por ID
    getById: (id) => apiCall(`/tags/${id}`),

    // Crear un nuevo tag
    create: (tagData) =>
        apiCall('/tags', {
            method: 'POST',
            body: tagData
        }),

    // Actualizar un tag
    update: (id, tagData) =>
        apiCall(`/tags/${id}`, {
            method: 'PUT',
            body: tagData
        }),

    // Eliminar un tag
    delete: (id) =>
        apiCall(`/tags/${id}`, {
            method: 'DELETE'
        })
};

