import React from 'react';
import './LinkCard.css';

// Recibimos el título, la descripción y un array con los nombres de los tags
function LinkCard({ titulo, descripcion, tags }) {
    return (
        <div className="link-card">
            {/* Caja gris que simula la imagen de previsualización del enlace */}
            <div className="link-card__image-placeholder"></div>

            <div className="link-card__info">
                <h4 className="link-card__title">{titulo}</h4>
                <p className="link-card__description">{descripcion}</p>

                {/* Renderizamos los tags dinámicamente si existen */}
                {tags && tags.length > 0 && (
                    <div className="link-card__tags">
                        {tags.map((tag, index) => (
                            <span key={index} className="link-card__tag">{tag}</span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default LinkCard;