import React from 'react';
import { useNavigate } from 'react-router-dom';
import iconoEditar from '../assets/Img/editar.svg';
import TagBadge from './TagBadge';
import './LinkCard.css';

function LinkCard({ bookmark }) {
    const navigate = useNavigate();

    const handleEdit = (e) => {
        e.stopPropagation();
        navigate('/gestionar-marcadores');
    };

    return (
        <div className="link-card">
            <div className="link-card__image"></div>

            <div className="link-card__content">
                <h3 className="link-card__title">{bookmark?.titulo || 'Lorem ipsum'}</h3>
                <p className="link-card__description">
                    {bookmark?.descripcion || 'Lorem ipsum dolor sit amet consectetur adipiscing elit...'}
                </p>

                <div className="link-card__tags">
                    {bookmark?.tags && bookmark.tags.length > 0 ? (
                        bookmark.tags.map(tag => (
                            <TagBadge 
                                key={tag.id}
                                texto={tag.nombre}
                                colorHex={tag.color}
                            />
                        ))
                    ) : (
                        <span style={{ fontSize: '12px', color: '#999' }}>Sin tags</span>
                    )}
                </div>
            </div>

            <button className="card__edit-btn card__edit-btn--top" onClick={handleEdit}>
                <img src={iconoEditar} alt="Editar" />
            </button>
        </div>
    );
}

export default LinkCard;