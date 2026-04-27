import React from 'react';
import './ManageFolderCenter.css';


function ManageFolderCenter({ folder, onChange, availableParents = [] }) {
    if (!folder) return null;

    return (
        <section className="manage-center">
            <div className="manage-card">

                <div className="manage-card__field">
                    <label>Nombre</label>
                    <input
                        type="text"
                        className="manage-card__input"
                        value={folder.name}
                        onChange={(e) => onChange('name', e.target.value)}
                    />
                </div>

                <div className="manage-card__field">
                    <label>Carpeta padre</label>

                    <select
                        className="manage-card__input"
                        value={folder.parent}
                        onChange={(e) => onChange('parent', e.target.value)}
                        style={{ cursor: 'pointer' }}
                    >

                        <option value="General">General</option>


                        {availableParents.map(parentFolder => (
                            <option key={parentFolder.id} value={parentFolder.name}>
                                {parentFolder.name}
                            </option>
                        ))}
                    </select>
                </div>

            </div>

            <div className="manage-card">
                <h3 className="manage-card__title">Informacion adicional</h3>
                <div className="manage-info-grid">
                    <div className="info-box">
                        <span className="info-box__label">Carpetas<br/>contenidas</span>
                        <span className="info-box__value">{folder.subfolders}</span>
                    </div>
                    <div className="info-box">
                        <span className="info-box__label">Marcadores<br/>contenidos</span>
                        <span className="info-box__value">{folder.bookmarks}</span>
                    </div>
                    <div className="info-box">
                        <span className="info-box__label">Fecha de<br/>creacion</span>
                        <span className="info-box__value info-box__value--small">{folder.date}</span>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ManageFolderCenter;