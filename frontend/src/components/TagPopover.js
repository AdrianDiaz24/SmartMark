import React from 'react';
import TagBadge from './TagBadge';
import './TagPopover.css';

function TagPopover({ isOpen, onClose, availableTags, selectedTags, onToggleTag }) {
    if (!isOpen) return null;

    return (
        <>
            {/* Capa de fondo para cerrar el popover al hacer clic fuera de él */}
            <div className="tag-popover-overlay" onClick={onClose}></div>

            <div className="tag-popover">
                <header className="tag-popover__header">
                    <span className="tag-popover__title">Tags</span>
                    <button type="button" className="tag-popover__add-new">+</button>
                </header>

                <div className="tag-popover__list">
                    {availableTags.map(tag => (
                        <TagBadge
                            key={tag.id}
                            texto={tag.name}
                            colorHex={tag.color}
                            isSelected={selectedTags.includes(tag.id)}
                            onClick={() => onToggleTag(tag.id)}
                        />
                    ))}
                </div>
            </div>
        </>
    );
}

export default TagPopover;