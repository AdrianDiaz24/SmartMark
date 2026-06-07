import React from 'react';
import { useSidebar } from '../context/SidebarContext';
import TagBadge from './TagBadge';
import './ManageSidebarTag.css';

function ManageSidebarTag({ title, items, selectedId, onSelect, onAdd }) {
    const { isMenuOpen, toggleMenu } = useSidebar();

    return (
        <>
            <div 
                className={`sidebar-overlay ${isMenuOpen ? 'sidebar-overlay--active' : ''}`}
                onClick={toggleMenu}
            ></div>
            <aside className={`manage-sidebar-tag ${isMenuOpen ? 'sidebar-container--open' : ''}`}>
                <div className="manage-sidebar-tag__card">
                    <div className="manage-sidebar-tag__header">
                        <h3>{title}</h3>
                        <button className="manage-sidebar-tag__add-btn" onClick={onAdd}>+</button>
                    </div>
                    <div className="manage-sidebar-tag__list">
                        {items.map(item => (
                            <div key={item.id} className="manage-sidebar-tag__item-wrapper">
                                <TagBadge
                                    texto={item.nombre}
                                    colorHex={item.color}
                                    isSelected={selectedId === item.id}
                                    onClick={() => onSelect(item)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </aside>
        </>
    );
}

export default ManageSidebarTag;