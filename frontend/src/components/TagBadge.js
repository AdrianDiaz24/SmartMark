import React from 'react';
import './TagBadge.css';

function TagBadge({ texto, colorHex, isSelected, onClick }) {
    // Si el color es amarillo o turquesa, usar texto negro, sino blanco
    const coloresOscuros = ['FFE943', '33DCCB'];
    const textColor = coloresOscuros.includes(colorHex) ? '#000000' : '#FFFFFF';

    return (
        <button
            type="button"
            className={`tag-badge ${isSelected ? 'tag-badge--selected' : ''}`}
            style={{ 
                backgroundColor: `#${colorHex}`,
                color: textColor
            }}
            onClick={onClick}
        >
            {texto}
        </button>
    );
}

export default TagBadge;