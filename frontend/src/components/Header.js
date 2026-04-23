import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateBookmarkModal from "./CreateBookmarkModal";
import './Header.css';

import Logo from '../assets/Img/Logo_SmartMark.png';
import Mas from '../assets/Img/mas_negro.png';

function Header() {
    const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false);
    const navigate = useNavigate(); //

    return(
        <header className="header">
            {}
            <section className="header__logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                <img src={Logo} alt="SmartMark" className="header__logo-img"/>
            </section>

            <section className={"header__search"}>
                <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" stroke="white" strokeWidth="2" fill="none">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input type={"text"} className={"header__search-input"} placeholder={"Buscar marcadores, dominios o tags"}/>
            </section>

            <section className={"header__add"}>
                <button className={"header__add-btn"} onClick={() => setIsBookmarkModalOpen(true)}>
                    <img src={Mas} alt="Agregar marcador" className={"header__add-icon"}/>
                    Añadir marcador
                </button>
            </section>

            <CreateBookmarkModal
                isOpen={isBookmarkModalOpen}
                onClose={() => setIsBookmarkModalOpen(false)}
            />
        </header>
    );
}

export default Header;