import React from 'react';
import './ManageSidebarFolder.css';
import iconoAñadir from '../assets/Img/añadir_carpeta.png';
import iconoCarpeta from '../assets/Img/carpeta.png';

function ManageSidebarFolder({ title, items, selectedId, onSelect, onAdd }) {


    const renderItem = (item, isSubfolder = false) => {
        const isActive = selectedId === item.id;

        return (
            <React.Fragment key={item.id}>

                <div
                    className={`manage-sidebar-folder__item ${isSubfolder ? 'manage-sidebar-folder__item--sub' : ''} ${isActive ? 'active' : ''}`}
                    onClick={() => onSelect(item)}
                >

                    {!isSubfolder && (
                        <img src={iconoCarpeta} alt="Carpeta" className="manage-sidebar-folder__icon" />
                    )}
                    <span>{item.name}</span>
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
        <aside className="manage-sidebar-folder">
            <div className="manage-sidebar-folder__header">
                <h3>{title}</h3>
                <button className="manage-sidebar-folder__add-btn" onClick={onAdd}>
                    <img src={iconoAñadir} alt={`Añadir ${title}`} className="manage-sidebar-folder__add-icon" />
                </button>
            </div>
            <div className="manage-sidebar-folder__list">
                {items.map(item => renderItem(item))}
            </div>
        </aside>
    );
}

export default ManageSidebarFolder;