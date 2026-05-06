// Configuración base de la API
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

export const apiCall = async (endpoint, options = {}) => {
    const { method = 'GET', body = null, headers = {} } = options;

    const config = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers
        }
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `Error ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error en llamada a ${endpoint}:`, error);
        throw error;
    }
};


