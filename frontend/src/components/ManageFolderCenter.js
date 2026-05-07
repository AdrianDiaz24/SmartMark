import React, { useState } from 'react';
import TagBadge from './TagBadge';
import TagPopover from './TagPopover';
import './ManageFolderCenter.css';


function ManageFolderCenter({ folder, onChange, availableParents = [], availableTags = [], onToggleTag }) {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    if (!folder) return null;

    // Mapear tanto 'name' (mockeados) como 'nombre' (backend)
    const displayName = folder.name || folder.nombre || '';
    const displaySubfolders = folder.subfolders || 0;
    const displayBookmarks = folder.bookmarks || 0;
    const displayDate = folder.date || folder.fecha_creacion || 'N/A';

    // Encontrar el nombre del padre actual
    const currentParent = folder.parentId ? availableParents.find(p => p.id === folder.parentId) : null;
    const displayParentName = currentParent ? currentParent.nombre || currentParent.name : '';

    return (
        <section className="manage-center">
            <div className="manage-card">

                <div className="manage-card__field">
                    <label>Nombre</label>
                    <input
                        type="text"
                        className="manage-card__input"
                        value={displayName}
                        onChange={(e) => onChange('name', e.target.value)}
                    />
                </div>

                <div className="manage-card__field">
                    <label>Carpeta padre</label>

                    <select
                        className="manage-card__input"
                        value={folder.parentId || ''}
                        onChange={(e) => onChange('parentId', e.target.value ? parseInt(e.target.value) : null)}
                        style={{ cursor: 'pointer' }}
                    >

                        <option value="">General (Sin carpeta padre)</option>


                        {availableParents.map(parentFolder => (
                            <option key={parentFolder.id} value={parentFolder.id}>
                                {parentFolder.name || parentFolder.nombre}
                            </option>
                        ))}
                    </select>
                </div>

            </div>

            <div className="manage-card">
                <h3 className="manage-card__title">Tags</h3>
                <div className="manage-card__field manage-card__tags-row" style={{ position: 'relative' }}>
                    <div className="manage-card__tags">
                        {folder.tags && folder.tags.map(tag => (
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
                            availableTags={availableTags}
                            selectedTags={folder.tags ? folder.tags.map(t => t.id) : []}
                            onToggleTag={onToggleTag}
                        />
                    </div>
                </div>
            </div>

            <div className="manage-card">
                <h3 className="manage-card__title">Informacion adicional</h3>
                <div className="manage-info-grid">
                    <div className="info-box">
                        <span className="info-box__label">Carpetas<br/>contenidas</span>
                        <span className="info-box__value">{displaySubfolders}</span>
                    </div>
                    <div className="info-box">
                        <span className="info-box__label">Marcadores<br/>contenidos</span>
                        <span className="info-box__value">{displayBookmarks}</span>
                    </div>
                    <div className="info-box">
                        <span className="info-box__label">Fecha de<br/>creacion</span>
                        <span className="info-box__value info-box__value--small">{displayDate}</span>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ManageFolderCenter;