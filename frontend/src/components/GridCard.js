import React from 'react';
import { useNavigate } from 'react-router-dom';
import iconoEditar from '../assets/Img/editar.svg';
import TagBadge from './TagBadge';
import './GridCard.css';

function GridCard({ bookmark }) {
    const navigate = useNavigate();

    const handleEdit = (e) => {
        e.stopPropagation();
        navigate('/gestionar-marcadores');
    };

    return (
        <div className="grid-card">
            <div className="grid-card__image"></div>

            <div className="grid-card__content">
                <h3 className="grid-card__title">{bookmark?.title || 'Lorem ipsum'}</h3>
                <p className="grid-card__description">
                    {bookmark?.description || 'Lorem ipsum dolor sit amet consectetur adipiscing elit...'}
                </p>

                <div className="grid-card__tags">
                    <TagBadge texto="tag 1" colorHex="51986C" />
                    <TagBadge texto="tag 3" colorHex="616060" />
                </div>
            </div>

            <button className="card__edit-btn card__edit-btn--bottom" onClick={handleEdit}>
                <img src={iconoEditar} alt="Editar" />
            </button>
        </div>
    );
}

export default GridCard;