import React from 'react';
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
                        {tags.map((tag, index) => (
                            <span key={index} className="grid-card__tag">{tag}</span>
                        ))}
                    </div>
                )}
            </div>
        </article>
    );
}

export default GridCard;