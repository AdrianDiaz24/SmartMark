import React, { useState } from 'react';
import TagBadge from './TagBadge';
import CreateTagModal from './CreateTagModal';
import './TagPopover.css';

function TagPopover({ isOpen, onClose, availableTags, selectedTags, onToggleTag }) {

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    if (!isOpen) return null;

    return (
        <>
            {}
            <div className="tag-popover-overlay" onClick={onClose}></div>

            <div className="tag-popover">
                <header className="tag-popover__header">
                    <span className="tag-popover__title">Tags</span>
                    {}
                    <button
                        type="button"
                        className="tag-popover__add-new"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        +
                    </button>
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

            {}
            <CreateTagModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </>
    );
}

export default TagPopover;