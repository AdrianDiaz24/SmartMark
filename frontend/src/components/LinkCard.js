import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import iconoEditar from '../assets/Img/editar.svg';
import iconoCarpeta from '../assets/Img/carpeta.png';
import logoSmartMark from '../assets/Img/Logo_SmartMark.png';
import TagBadge from './TagBadge';
import './LinkCard.css';

function LinkCard({ bookmark, folder }) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const isFolder = !!folder;
    const item = folder || bookmark;

    const handleEdit = (e) => {
        e.stopPropagation();
        if (isFolder) {
            navigate('/gestionar-carpetas');
        } else {
            navigate('/gestionar-marcadores');
        }
    };

    const handleFolderClick = () => {
        if (isFolder) {
            const currentTag = searchParams.get('tag');
            if (currentTag) {
                navigate(`/todos?carpeta=${folder.id}&tag=${currentTag}`);
            } else {
                navigate(`/todos?carpeta=${folder.id}`);
            }
        }
    };

    return (
        <div className="link-card" onClick={isFolder ? handleFolderClick : null} style={{ cursor: isFolder ? 'pointer' : 'default' }}>
            <div className={`link-card__image ${isFolder ? 'link-card__image--folder' : ''}`}>
                {isFolder ? (
                    <img src={iconoCarpeta} alt="Carpeta" className="link-card__icon" />
                ) : (
                    <img src={bookmark?.portada || logoSmartMark} alt="Marcador" className="link-card__logo" />
                )}
            </div>

            <div className="link-card__content">
                <h3 className="link-card__title">
                    {isFolder ? folder?.nombre : bookmark?.titulo || 'Lorem ipsum'}
                </h3>
                <p className="link-card__description">
                    {isFolder ? `${folder?.bookmarks || 0} marcadores` : (bookmark?.descripcion || 'Lorem ipsum dolor sit amet consectetur adipiscing elit...')}
                </p>

                <div className="link-card__tags">
                    {!isFolder && bookmark?.tags && bookmark.tags.length > 0 ? (
                        bookmark.tags.map(tag => (
                            <TagBadge 
                                key={tag.id}
                                texto={tag.nombre}
                                colorHex={tag.color}
                            />
                        ))
                    ) : isFolder && folder?.tags && folder.tags.length > 0 ? (
                        folder.tags.map(tag => (
                            <TagBadge 
                                key={tag.id}
                                texto={tag.nombre}
                                colorHex={tag.color}
                            />
                        ))
                    ) : isFolder ? (
                        <span style={{ fontSize: '12px', color: '#999' }}>Carpeta</span>
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