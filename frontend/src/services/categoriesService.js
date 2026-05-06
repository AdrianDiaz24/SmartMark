import { apiCall } from './api';

export const categoriesService = {
    // Obtener todas las categorías
    getAll: () => apiCall('/categories'),

    // Obtener una categoría por ID
    getById: (id) => apiCall(`/categories/${id}`),

    // Crear una nueva categoría
    create: (categoryData) =>
        apiCall('/categories', {
            method: 'POST',
            body: categoryData
        }),

    // Actualizar una categoría
    update: (id, categoryData) =>
        apiCall(`/categories/${id}`, {
            method: 'PUT',
            body: categoryData
        }),

    // Eliminar una categoría
    delete: (id, deleteBookmarks = false) =>
        apiCall(`/categories/${id}?deleteBookmarks=${deleteBookmarks}`, {
            method: 'DELETE'
        })
};

