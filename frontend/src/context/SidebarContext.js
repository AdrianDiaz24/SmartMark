import React, { createContext, useContext, useState, useEffect } from 'react';

const SidebarContext = createContext();

export function SidebarProvider({ children }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        // Cerrar menú cuando cambias a pantalla grande
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);
    const openMenu = () => setIsMenuOpen(true);

    return (
        <SidebarContext.Provider value={{ isMenuOpen, toggleMenu, closeMenu, openMenu }}>
            {children}
        </SidebarContext.Provider>
    );
}

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error('useSidebar debe ser usado dentro de SidebarProvider');
    }
    return context;
};

