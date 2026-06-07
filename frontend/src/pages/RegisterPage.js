import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

function RegisterPage() {
    const navigate = useNavigate();
    const { register } = useAuth();
    
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validaciones
        if (!email || !username || !password || !confirmPassword) {
            setError('Por favor completa todos los campos');
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            setLoading(false);
            return;
        }

        if (password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres');
            setLoading(false);
            return;
        }

        if (username.length < 3) {
            setError('El nombre de usuario debe tener al menos 3 caracteres');
            setLoading(false);
            return;
        }

        const result = await register(email, username, password);
        
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
                    <h1 className="auth-title">Registrarse</h1>
                    <p className="auth-subtitle">Crea tu cuenta en SmartMark</p>

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
                            <label htmlFor="username">Nombre de usuario</label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Usuario"
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

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirmar contraseña</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
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
                            {loading ? 'Creando cuenta...' : 'Registrarse'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>¿Ya tienes cuenta? 
                            <Link to="/login" className="auth-link">Inicia sesión aquí</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;

