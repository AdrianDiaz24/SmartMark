import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSearch } from '../context/SearchContext';
import { useAuth } from '../context/AuthContext';
import CreateBookmarkModal from "./CreateBookmarkModal";
import './Header.css';

import Logo from '../assets/Img/Logo_SmartMark.png';
import Mas from '../assets/Img/mas_negro.png';

function Header() {
    const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { searchTerm, updateSearchTerm, clearSearch } = useSearch();
    const { usuario, logout } = useAuth();

    // Obtener carpeta activa del URL
    const activeFolderId = searchParams.get('carpeta');

    // Actualizar búsqueda en tiempo real
    const handleSearchChange = (e) => {
        const term = e.target.value;
        updateSearchTerm(term);
    };

    // Al presionar Enter, navegar a BookmarksPage
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && searchTerm.trim()) {
            e.preventDefault();
            
            // Preservar filtros existentes
            const params = new URLSearchParams();
            const existingFolder = searchParams.get('carpeta');
            const existingTag = searchParams.get('tag');
            
            if (existingFolder) params.set('carpeta', existingFolder);
            if (existingTag) params.set('tag', existingTag);
            params.set('search', searchTerm.trim());
            
            // Navegar a BookmarksPage con el parámetro de búsqueda
            navigate(`/todos?${params.toString()}`);
            clearSearch();
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsUserMenuOpen(false);
    };

    return(
        <header className="header">
            <section className="header__logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                <img src={Logo} alt="SmartMark" className="header__logo-img"/>
            </section>

            <form className={"header__search"} onSubmit={(e) => { e.preventDefault(); handleKeyPress({key: 'Enter'}); }}>
                <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" stroke="white" strokeWidth="2" fill="none">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input 
                    type="text" 
                    className="header__search-input" 
                    placeholder="Buscar marcadores, dominios o tags"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onKeyPress={handleKeyPress}
                />
            </form>

            <section className={"header__actions"}>
                <button className={"header__add-btn"} onClick={() => setIsBookmarkModalOpen(true)}>
                    <img src={Mas} alt="Agregar marcador" className={"header__add-icon"}/>
                    Añadir marcador
                </button>

                <div className="header__user">
                    <button 
                        className="header__user-btn"
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        title={usuario?.username}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </button>

                    {isUserMenuOpen && (
                        <div className="header__user-menu">
                            <p className="header__user-name">{usuario?.username}</p>
                            <p className="header__user-email">{usuario?.email}</p>
                            <hr className="header__user-divider" />
                            <button 
                                className="header__logout-btn"
                                onClick={handleLogout}
                            >
                                Cerrar sesión
                            </button>
                        </div>
                    )}
                </div>
            </section>

            <CreateBookmarkModal
                isOpen={isBookmarkModalOpen}
                onClose={() => setIsBookmarkModalOpen(false)}
                defaultFolderId={activeFolderId}
            />
        </header>
    );
}

export default Header;