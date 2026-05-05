import React from 'react';
import './ManageTagCenter.css';

const TAG_COLORS = [
    'FF4343', '6155FF', '3D93D1', '51986C',
    'FFDF3A', 'ED3AFF', '3AE2FF', '616060'
];

function ManageTagCenter({ tag, onChange }) {
    if (!tag) return null;

    return (
        <section className="manage-center">
            <div className="manage-card">
                <div className="manage-card__field">
                    <label>Nombre</label>
                    <input
                        type="text"
                        className="manage-card__input"
                        value={tag.name}
                        onChange={(e) => onChange('name', e.target.value)}
                    />
                </div>

                <div className="manage-card__field">
                    <label>Color</label>
                    <div className="manage-card__color-grid">
                        {TAG_COLORS.map(color => (
                            <button
                                key={color}
                                type="button"
                                className={`manage-card__color-swatch ${tag.color === color ? 'manage-card__color-swatch--selected' : ''}`}
                                style={{ backgroundColor: `#${color}` }}
                                onClick={() => onChange('color', color)}
                                aria-label={`Seleccionar color #${color}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="manage-card">
                <h3 className="manage-card__title">Informacion adicional</h3>
                <div className="manage-info-grid">
                    <div className="info-box">
                        <span className="info-box__label">Carpetas<br/>tagueadas</span>
                        <span className="info-box__value">{tag.foldersTagged}</span>
                    </div>
                    <div className="info-box">
                        <span className="info-box__label">Marcadores<br/>tagueados</span>
                        <span className="info-box__value">{tag.bookmarksTagged}</span>
                    </div>
                    <div className="info-box">
                        <span className="info-box__label">Fecha de<br/>creacion</span>
                        <span className="info-box__value info-box__value--small">{tag.date}</span>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ManageTagCenter;