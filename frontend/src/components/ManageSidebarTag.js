import React from 'react';
import TagBadge from './TagBadge';
import './ManageSidebarTag.css';

function ManageSidebarTag({ title, items, selectedId, onSelect, onAdd }) {
    return (
        <aside className="manage-sidebar-tag">
            <div className="manage-sidebar-tag__header">
                <h3>{title}</h3>
                <button className="manage-sidebar-tag__add-btn" onClick={onAdd}>+</button>
            </div>
            <div className="manage-sidebar-tag__list">
                {items.map(item => (
                    <div key={item.id} className="manage-sidebar-tag__item-wrapper">
                        <TagBadge
                            texto={item.name}
                            colorHex={item.color}
                            isSelected={selectedId === item.id}
                            onClick={() => onSelect(item)}
                        />
                    </div>
                ))}
            </div>
        </aside>
    );
}

export default ManageSidebarTag;