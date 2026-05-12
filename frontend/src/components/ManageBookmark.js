import React, { useRef, useState } from 'react';
import TagBadge from './TagBadge';
import TagPopover from './TagPopover';
import './ManageBookmark.css';

function ManageBookmark({ bookmark, onChange, onFileChange, availableFolders = [], systemTags = [], onToggleTag }) {
    const fileInputRef = useRef(null);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    if (!bookmark) return null;

    const handleFileUploadClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (onFileChange) {
                onFileChange(file);
            }
        }
    };

    return (
        <section className="manage-center">
            <div className="manage-card manage-card--full-form">

                <div className={`manage-card__image-placeholder ${(bookmark.portada && bookmark.portada.trim && bookmark.portada.trim() !== '') ? 'manage-card__image-placeholder--has-image' : ''}`}>
                    {bookmark.portada && bookmark.portada.trim && bookmark.portada.trim() !== '' && (
                        <img 
                            src={
                                typeof bookmark.portada === 'string'
                                    ? (() => {
                                        // Si ya es un data URI, devolverlo tal cual
                                        if (bookmark.portada.startsWith('data:')) {
                                            return bookmark.portada;
                                        }
                                        // Si es base64 puro, convertir a data URI
                                        let mimeType = 'image/png'; // Por defecto
                                        if (bookmark.portada.startsWith('/9j/')) {
                                            mimeType = 'image/jpeg';
                                        } else if (bookmark.portada.startsWith('PHN2')) {
                                            mimeType = 'image/svg+xml';
                                        }
                                        return `data:${mimeType};base64,${bookmark.portada}`;
                                      })()
                                    : bookmark.portada
                            }
                            alt="Portada actual"
                            style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '10px' }}
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                    )}
                </div>

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
                        value={bookmark.titulo || ''}
                        onChange={(e) => onChange('titulo', e.target.value)}
                    />
                </div>

                <div className="manage-card__field">
                    <label>Descripcion</label>
                    <textarea
                        className="manage-card__textarea"
                        value={bookmark.descripcion || ''}
                        onChange={(e) => onChange('descripcion', e.target.value)}
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
                            value={bookmark.categoria_id || ''}
                            onChange={(e) => onChange('categoria_id', e.target.value)}
                        >
                            <option value="">Sección general</option>
                            {availableFolders.map(folder => (
                                <option key={folder.id} value={folder.id}>{folder.nombre}</option>
                            ))}
                        </select>
                        <p>Por defecto, el marcador se guardara en la seccion general</p>
                    </div>
                </div>

                <div className="manage-card__field manage-card__tags-row" style={{ position: 'relative' }}>
                    <label>Tags:</label>
                    <div className="manage-card__tags">
                        {bookmark.tags && bookmark.tags.map(tag => (
                            <TagBadge key={tag.id} texto={tag.nombre} colorHex={tag.color} isSelected={false} />
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