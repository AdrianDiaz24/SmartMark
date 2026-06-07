import React from 'react';
import { useSidebar } from '../context/SidebarContext';
import './ManageSidebarFolder.css';
import iconoAñadir from '../assets/Img/añadir_carpeta.png';
import iconoCarpeta from '../assets/Img/carpeta.png';

function ManageSidebarFolder({ title, items, selectedId, onSelect, onAdd }) {
    const { isMenuOpen, toggleMenu } = useSidebar();

    const renderItem = (item, isSubfolder = false) => {
        const isActive = selectedId === item.id;
        // Mapear tanto 'name' (mockeados) como 'nombre' (backend)
        const itemName = item.name || item.nombre;

        return (
            <React.Fragment key={item.id}>

                <div
                    className={`manage-sidebar-folder__item ${isSubfolder ? 'manage-sidebar-folder__item--sub' : ''} ${isActive ? 'active' : ''}`}
                    onClick={() => onSelect(item)}
                >

                    {!isSubfolder && (
                        <img src={iconoCarpeta} alt="Carpeta" className="manage-sidebar-folder__icon" />
                    )}
                    <span>{itemName}</span>
                </div>


                {item.children && item.children.length > 0 && (
                    <div className="manage-sidebar-folder__sublist">
                        {item.children.map(child => renderItem(child, true))}
                    </div>
                )}
            </React.Fragment>
        );
    };

    return (
        <>
            <div 
                className={`sidebar-overlay ${isMenuOpen ? 'sidebar-overlay--active' : ''}`}
                onClick={toggleMenu}
            ></div>
            <aside className={`manage-sidebar-folder ${isMenuOpen ? 'sidebar-container--open' : ''}`}>
                <div className="manage-sidebar-folder__card">
                    <div className="manage-sidebar-folder__header">
                        <h3>{title}</h3>
                        <button className="manage-sidebar-folder__add-btn" onClick={onAdd}>
                            <img src={iconoAñadir} alt={`Añadir ${title}`} className="manage-sidebar-folder__add-icon" />
                        </button>
                    </div>
                    <div className="manage-sidebar-folder__list">
                        {items.map(item => renderItem(item))}
                    </div>
                </div>
            </aside>
        </>
    );
}

export default ManageSidebarFolder;