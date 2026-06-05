import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!email || !password) {
            setError('Por favor completa todos los campos');
            setLoading(false);
            return;
        }

        const result = await login(email, password);
        
        if (result.success) {
            navigate('/');
        } else {
            setError(result.error);
        }
        
        setLoading(false);
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card">
                    <h1 className="auth-title">Iniciar Sesión</h1>
                    <p className="auth-subtitle">Accede a tu cuenta en SmartMark</p>

                    {error && <div className="auth-error">{error}</div>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Correo electronico"
                                disabled={loading}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Contraseña</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                disabled={loading}
                                className="form-input"
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="auth-button"
                        >
                            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>¿No tienes cuenta? 
                            <Link to="/registro" className="auth-link">Regístrate aquí</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;

