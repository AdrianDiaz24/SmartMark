import React, { createContext, useState, useCallback, useEffect, useContext } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Al montar, verificar si hay token en localStorage
    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('usuario');
        
        if (savedToken && savedUser) {
            try {
                setToken(savedToken);
                setUsuario(JSON.parse(savedUser));
            } catch (err) {
                console.error('Error al recuperar sesión:', err);
                localStorage.removeItem('token');
                localStorage.removeItem('usuario');
            }
        }
        
        setLoading(false);
    }, []);

    const register = useCallback(async (email, username, password) => {
        try {
            setError(null);
            const response = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, username, password })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error en el registro');
            }

            const data = await response.json();
            
            // Guardar token y usuario
            localStorage.setItem('token', data.token);
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            
            setToken(data.token);
            setUsuario(data.usuario);
            
            return { success: true, usuario: data.usuario };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    }, []);

    const login = useCallback(async (email, password) => {
        try {
            setError(null);
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Email o contraseña incorrectos');
            }

            const data = await response.json();
            
            // Guardar token y usuario
            localStorage.setItem('token', data.token);
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            
            setToken(data.token);
            setUsuario(data.usuario);
            
            return { success: true, usuario: data.usuario };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        setToken(null);
        setUsuario(null);
        setError(null);
    }, []);

    const isAuthenticated = () => !!token && !!usuario;

    const value = {
        usuario,
        token,
        loading,
        error,
        register,
        login,
        logout,
        isAuthenticated
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context;
}

