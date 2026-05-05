import React, { useRef, useState } from 'react';
import TagBadge from './TagBadge';
import TagPopover from './TagPopover';
import './ManageBookmark.css';

function ManageBookmark({ bookmark, onChange, availableFolders = [], systemTags = [], onToggleTag }) {
    const fileInputRef = useRef(null);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    if (!bookmark) return null;

    const handleFileUploadClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            console.log("Archivo seleccionado:", file.name);
        }
    };

    return (
        <section className="manage-center">
            <div className="manage-card manage-card--full-form">

                <div className="manage-card__image-placeholder"></div>

                <div className="manage-card__field">
                    <label>URL</label>
                    <input
                        type="text"
                        className="manage-card__input"
                        value={bookmark.url || ''}
                        onChange={(e) => onChange('url', e.target.value)}
                    />
                </div>

                <div className="manage-card__field">
                    <label>Nombre</label>
                    <input
                        type="text"
                        className="manage-card__input"
                        value={bookmark.name || ''}
                        onChange={(e) => onChange('name', e.target.value)}
                    />
                </div>

                <div className="manage-card__field">
                    <label>Descripcion</label>
                    <textarea
                        className="manage-card__textarea"
                        value={bookmark.description || ''}
                        onChange={(e) => onChange('description', e.target.value)}
                        rows="4"
                    />
                </div>

                <div className="manage-card__field manage-card__portada-row">
                    <div className="portada-info">
                        <label>Portada</label>
                        <p>Elija una imagen de portada (archivos permitidos: .png, .jpg, .svg)</p>
                    </div>
                    <button className="manage-btn manage-btn--light" onClick={handleFileUploadClick}>
                        Subir imagen
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        accept=".png, .jpg, .jpeg, .svg"
                        onChange={handleFileChange}
                    />
                </div>

                <div className="manage-card__field manage-card__carpeta-row">
                    <label>Carpeta</label>
                    <div className="carpeta-actions">
                        <select
                            className="manage-card__input manage-card__input--select"
                            value={bookmark.folder || 'General'}
                            onChange={(e) => onChange('folder', e.target.value)}
                        >
                            <option value="General">General</option>
                            {availableFolders.map(folder => (
                                <option key={folder} value={folder}>{folder}</option>
                            ))}
                        </select>
                        <p>Por defecto, el marcador se guardara en la seccion general</p>
                    </div>
                </div>

                <div className="manage-card__field manage-card__tags-row" style={{ position: 'relative' }}>
                    <label>Tags:</label>
                    <div className="manage-card__tags">
                        {bookmark.tags && bookmark.tags.map(tag => (
                            <TagBadge key={tag.id} texto={tag.name} colorHex={tag.color} isSelected={false} />
                        ))}

                        <button
                            type="button"
                            className="manage-sidebar__add-btn--tags"
                            title="Añadir tag"
                            onClick={() => setIsPopoverOpen(true)}
                        >
                            +
                        </button>

                        <TagPopover
                            isOpen={isPopoverOpen}
                            onClose={() => setIsPopoverOpen(false)}
                            availableTags={systemTags}
                            selectedTags={bookmark.tags ? bookmark.tags.map(t => t.id) : []}
                            onToggleTag={onToggleTag}
                        />
                    </div>
                </div>

            </div>
        </section>
    );
}

export default ManageBookmark;