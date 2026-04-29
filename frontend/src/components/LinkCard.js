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
                <h3 className="link-card__title">{bookmark?.title || 'Lorem ipsum'}</h3>
                <p className="link-card__description">
                    {bookmark?.description || 'Lorem ipsum dolor sit amet consectetur adipiscing elit...'}
                </p>

                <div className="link-card__tags">
                    <TagBadge texto="tag 1" colorHex="51986C" />
                    <TagBadge texto="tag 3" colorHex="616060" />
                </div>
            </div>

            <button className="card__edit-btn card__edit-btn--top" onClick={handleEdit}>
                <img src={iconoEditar} alt="Editar" />
            </button>
        </div>
    );
}

export default LinkCard;