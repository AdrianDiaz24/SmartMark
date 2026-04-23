import React from 'react';
import TagBadge from './TagBadge';
import './GridCard.css';

function GridCard({ titulo, descripcion, tags }) {
    return (
        <article className="grid-card">
            <div className="grid-card__image-placeholder"></div>
            <div className="grid-card__info">
                <h4 className="grid-card__title">{titulo}</h4>
                <p className="grid-card__description">{descripcion}</p>

                {tags && tags.length > 0 && (
                    <div className="grid-card__tags">
                        {tags.map((tag) => (
                            <TagBadge key={tag.id} texto={tag.name} colorHex={tag.color} isSelected={false} />
                        ))}
                    </div>
                )}
            </div>
        </article>
    );
}

export default GridCard;