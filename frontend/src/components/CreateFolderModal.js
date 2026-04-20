import React, { useState } from 'react';
import TagBadge from './TagBadge';
import TagPopover from './TagPopover';
import './CreateFolderModal.css';

// Datos de prueba
const MOCK_TAGS = [
    { id: 1, name: 'tag 1', color: '51986C' },
    { id: 2, name: 'tag 2', color: 'FF4343' },
    { id: 3, name: 'tag 3: lorem ipsum', color: '616060' }
];

function CreateFolderModal({ isOpen, onClose }) {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [selectedTagIds, setSelectedTagIds] = useState([]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Creando carpeta con tags:", selectedTagIds);
        onClose();
    };

    const handleToggleTag = (tagId) => {
        setSelectedTagIds((prevIds) => {
            if (prevIds.includes(tagId)) {
                return prevIds.filter(id => id !== tagId);
            } else {
                return [...prevIds, tagId];
            }
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <section className="modal-content" onClick={(e) => e.stopPropagation()} aria-labelledby="modal-title">
                <h2 id="modal-title" className="modal__title">Crear carpeta</h2>

                <form onSubmit={handleSubmit}>

                    <div className="modal__field">
                        <label htmlFor="folder-name">Nombre</label>
                        <input id="folder-name" type="text" placeholder="Introduzca el nombre de la carpeta" className="modal__input" />
                    </div>

                    <div className="modal__field">
                        <label htmlFor="parent-folder">Carpeta padre</label>
                        <select id="parent-folder" className="modal__select" defaultValue="">
                            <option value="" disabled>Seleccione la carpeta padre</option>
                            <option value="general">General</option>
                        </select>
                        <span className="modal__help-text">Por defecto la carpeta padre sera la general</span>
                    </div>

                    {}
                    {}
                    <div className="modal__field modal__field--inline">
                        <label>Tags:</label>

                        {}
                        <div className="modal__selected-tags">
                            {selectedTagIds.map(id => {
                                const tagData = MOCK_TAGS.find(t => t.id === id);
                                return (
                                    <TagBadge
                                        key={tagData.id}
                                        texto={tagData.name}
                                        colorHex={tagData.color}
                                        isSelected={false}
                                    />
                                );
                            })}
                        </div>

                        <button
                            type="button"
                            className="modal__add-tag-btn"
                            onClick={() => setIsPopoverOpen(true)}
                        >
                            +
                        </button>

                        <TagPopover
                            isOpen={isPopoverOpen}
                            onClose={() => setIsPopoverOpen(false)}
                            availableTags={MOCK_TAGS}
                            selectedTags={selectedTagIds}
                            onToggleTag={handleToggleTag}
                        />
                    </div>

                    <div className="modal__actions">
                        <button type="submit" className="modal__submit-btn">Crear</button>
                    </div>

                </form>
            </section>
        </div>
    );
}

export default CreateFolderModal;