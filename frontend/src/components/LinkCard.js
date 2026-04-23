import React from 'react';
import TagBadge from './TagBadge';
import './LinkCard.css';

function LinkCard({ titulo, descripcion, tags }) {
    return (
        <article className="link-card">
            <div className="link-card__image-placeholder"></div>
            <div className="link-card__info">
                <h4 className="link-card__title">{titulo}</h4>
                <p className="link-card__description">{descripcion}</p>

                {tags && tags.length > 0 && (
                    <div className="link-card__tags">
                        {tags.map((tag) => (
                            <TagBadge key={tag.id} texto={tag.name} colorHex={tag.color} isSelected={false} />
                        ))}
                    </div>
                )}
            </div>
        </article>
    );
}

export default LinkCard;