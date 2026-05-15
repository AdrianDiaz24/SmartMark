import React, { useRef, useState } from 'react';
import TagBadge from './TagBadge';
import TagPopover from './TagPopover';
import './ManageBookmark.css';

function ManageBookmark({ bookmark, onChange, onFileChange, availableFolders = [], systemTags = [], onToggleTag, onRemovePortada }) {
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

    const handleRemovePortada = (e) => {
        e.stopPropagation();
        if (onRemovePortada) {
            onRemovePortada();
        }
    };

    // Función para aplanar las carpetas y mostrar todas incluyendo subcarpetas
    const flattenFolders = (folders, prefix = '') => {
        let result = [];
        (folders || []).forEach(folder => {
            result.push({
                ...folder,
                displayName: prefix + folder.nombre
            });
            if (folder.children && folder.children.length > 0) {
                result = result.concat(flattenFolders(folder.children, prefix + '  '));
            }
        });
        return result;
    };

    return (
        <section className="manage-center">
            <div className="manage-card manage-card--full-form">

                {bookmark.portada && bookmark.portada.trim && bookmark.portada.trim() !== '' && (
                    <div className="manage-card__image-placeholder manage-card__image-placeholder--has-image">
                        <button 
                            className="manage-card__image-delete-btn"
                            onClick={handleRemovePortada}
                            title="Borrar imagen"
                            type="button"
                        >
                            ✕
                        </button>
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
                    </div>
                )}

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

                {bookmark.url && bookmark.url.includes('github.com') && bookmark.github_stars !== undefined && bookmark.github_stars !== null && (
                    <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #e0e0e0' }}>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
                            📊 Datos de GitHub
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', marginBottom: '10px', lineHeight: '1.6', color: '#BDBDBD' }}>
                            <div>
                                Estrellas: {bookmark.github_stars}
                            </div>
                            <div>
                                Forks: {bookmark.github_forks}
                            </div>
                            <div>
                                Visualizaciones: {bookmark.github_watchers}
                            </div>
                        </div>
                        {bookmark.github_languages && Array.isArray(bookmark.github_languages) && bookmark.github_languages.length > 0 && (
                            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #e0e0e0' }}>
                                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#333', marginBottom: '5px' }}>Lenguajes:</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                    {bookmark.github_languages.map(lang => (
                                        <span key={lang} style={{ backgroundColor: '#e3f2fd', color: '#1976d2', padding: '3px 8px', borderRadius: '12px', fontSize: '11px' }}>
                                            {lang}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

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
                            {flattenFolders(availableFolders).map(folder => (
                                <option key={folder.id} value={folder.id}>{folder.displayName}</option>
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