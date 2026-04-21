import React, { useState } from 'react';
import TagBadge from './TagBadge';
import TagPopover from './TagPopover';
import './CreateBookmarkModal.css';

// mismos datos de prueba de momento
const MOCK_TAGS = [
    { id: 1, name: 'tag 1', color: '51986C' },
    { id: 2, name: 'tag 2', color: 'FF4343' },
    { id: 3, name: 'tag 3: lorem ipsum', color: '616060' }
];

function CreateBookmarkModal({ isOpen, onClose }) {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [selectedTagIds, setSelectedTagIds] = useState([]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Creando marcador con tags:", selectedTagIds);
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
            {}
            <section className="modal-content modal-content--large" onClick={(e) => e.stopPropagation()} aria-labelledby="bookmark-modal-title">

                {}
                <h2 id="bookmark-modal-title" className="visually-hidden">Crear nuevo marcador</h2>

                <form onSubmit={handleSubmit} className="bookmark-form">

                    <div className="modal__field">
                        <label htmlFor="bookmark-url">URL</label>
                        <input id="bookmark-url" type="url" placeholder="Introduzca la URL del sitio web" className="modal__input" required />
                    </div>

                    <div className="modal__field">
                        <label htmlFor="bookmark-name">Nombre</label>
                        <input id="bookmark-name" type="text" placeholder="Introduzca el nombre del sitio web" className="modal__input" required />
                    </div>

                    <div className="modal__field">
                        <label htmlFor="bookmark-desc">Descripcion</label>
                        {}
                        <textarea id="bookmark-desc" placeholder="Introduzca la descripcion del sitio web" className="modal__input modal__textarea"></textarea>
                    </div>

                    {}
                    <div className="modal__field modal__field--file">
                        <div className="modal__file-info">
                            <label>Portada</label>
                            <span className="modal__help-text">Eliga una imagen de portada (archivos permitidos: .png, .jpg, .svg)</span>
                        </div>
                        {}
                        <label className="modal__upload-btn">
                            Subir imagen
                            <input type="file" accept=".png, .jpg, .svg" className="visually-hidden" />
                        </label>
                    </div>

                    {}
                    {/* Fila de la carpeta */}
                    <div className="modal__field">
                        <label htmlFor="bookmark-folder">Carpeta</label>
                        <div className="modal__folder-row">
                            <select id="bookmark-folder" className="modal__select modal__select--small" defaultValue="">
                                <option value="" disabled>Seleccione una carpeta</option>
                                <option value="carpeta1">Carpeta 1</option>
                                <option value="subcarpeta1">&nbsp;&nbsp;&nbsp;↳ Subcarpeta 1</option>
                                <option value="subcarpeta2">&nbsp;&nbsp;&nbsp;↳ Subcarpeta 2</option>
                                <option value="carpeta2">Carpeta 2</option>
                                <option value="carpeta3">Carpeta 3</option>
                            </select>
                            <span className="modal__help-text">Por defecto, el marcador se<br/>guardara en la seccion general</span>
                        </div>
                    </div>

                    {}
                    <div className="modal__field modal__field--inline">
                        <label>Tags:</label>

                        <div className="modal__selected-tags">
                            {selectedTagIds.map(id => {
                                const tagData = MOCK_TAGS.find(t => t.id === id);
                                return (
                                    <TagBadge key={tagData.id} texto={tagData.name} colorHex={tagData.color} isSelected={false} />
                                );
                            })}
                        </div>

                        <button type="button" className="modal__add-tag-btn" onClick={() => setIsPopoverOpen(true)}>
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

export default CreateBookmarkModal;