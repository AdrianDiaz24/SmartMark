import React from 'react';
import TagBadge from './TagBadge';
import './BookmarkCard.css';

function BookmarkCard({ titulo, descripcion, tags, viewMode }) {
    
    const layoutClass = viewMode === 'grid' ? 'bookmark-card--grid' : 'bookmark-card--list';

    return (
        <article className={`bookmark-card ${layoutClass}`}>
            <div className="bookmark-card__image-placeholder"></div>

            <div className="bookmark-card__info">
                <h4 className="bookmark-card__title">{titulo}</h4>
                <p className="bookmark-card__description">{descripcion}</p>

                {tags && tags.length > 0 && (
                    <div className="bookmark-card__tags">
                        {tags.map((tag) => (
                            <TagBadge
                                key={tag.id}
                                texto={tag.name}
                                colorHex={tag.color}
                                isSelected={false}
                            />
                        ))}
                    </div>
                )}
            </div>
        </article>
    );
}

export default BookmarkCard;