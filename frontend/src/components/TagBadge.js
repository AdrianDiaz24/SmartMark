import React from 'react';
import './TagBadge.css';

function TagBadge({ texto, colorHex, isSelected, onClick }) {
    return (
        <button
            type="button"
            className={`tag-badge ${isSelected ? 'tag-badge--selected' : ''}`}
            style={{ backgroundColor: `#${colorHex}` }}
            onClick={onClick}
        >
            {texto}
        </button>
    );
}

export default TagBadge;