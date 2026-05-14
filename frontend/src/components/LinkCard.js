import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import iconoEditar from '../assets/Img/editar.svg';
import iconoCarpeta from '../assets/Img/carpeta.png';
import logoSmartMark from '../assets/Img/Logo_SmartMark.png';
import TagBadge from './TagBadge';
import { bookmarksService } from '../services/bookmarksService';
import './LinkCard.css';

function LinkCard({ bookmark, folder }) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const isFolder = !!folder;
    const item = folder || bookmark;

    const handleEdit = (e) => {
        e.stopPropagation();
        if (isFolder) {
            navigate(`/gestionar-carpetas?id=${folder.id}`);
        } else {
            navigate(`/gestionar-marcadores?id=${bookmark.id}`);
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
        } else if (bookmark) {
            // Registrar el acceso al marcador
            bookmarksService.recordAccess(bookmark.id).catch(err => {
                console.error('Error registrando acceso:', err);
            });
            
            // Si es un bookmark, visitar la URL
            let url = bookmark.url;
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
            }
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    const getImageSrc = () => {
        if (isFolder) {
            return iconoCarpeta;
        }
        // Para bookmarks: si hay portada, mostrarla; si no, mostrar logo de SmartMark
        if (bookmark?.portada) {
            // Si portada es base64, convertir a data URI
            if (typeof bookmark.portada === 'string' && bookmark.portada) {
                // Si ya es un data URI, devolverlo tal cual
                if (bookmark.portada.startsWith('data:')) {
                    return bookmark.portada;
                }
                // Si es base64, convertir a data URI
                // Intentar detectar tipo de imagen por el contenido
                let mimeType = 'image/png'; // Por defecto
                if (bookmark.portada.startsWith('/9j/')) {
                    mimeType = 'image/jpeg'; // JPEG
                } else if (bookmark.portada.startsWith('PHN2')) {
                    mimeType = 'image/svg+xml'; // SVG (codificado en base64)
                }
                return `data:${mimeType};base64,${bookmark.portada}`;
            }
            return bookmark.portada;
        }
        return logoSmartMark;
    };

    // Verificar si el bookmark tiene una portada customizada (no es undefined, null o string vacío)
    const hasCustomPortada = !!(
        bookmark?.portada && 
        typeof bookmark.portada === 'string' && 
        bookmark.portada.trim() !== ''
    ) && !isFolder;

    return (
        <div className="link-card" onClick={handleFolderClick} style={{ cursor: isFolder || bookmark ? 'pointer' : 'default' }}>
            <div className={`link-card__image ${isFolder ? 'link-card__image--folder' : ''} ${!hasCustomPortada && !isFolder ? 'link-card__image--logo' : ''}`}>
                <img 
                    src={getImageSrc()} 
                    alt={isFolder ? 'Carpeta' : 'Marcador'} 
                    className={`${isFolder ? 'link-card__icon' : hasCustomPortada ? 'link-card__logo' : 'link-card__logo-smartmark'}`}
                    onError={(e) => {
                        e.target.src = isFolder ? iconoCarpeta : logoSmartMark;
                    }}
                />
            </div>

            <div className="link-card__content">
                <h3 className="link-card__title">
                    {isFolder ? folder?.nombre : bookmark?.titulo || 'Sin título'}
                </h3>
                <p className="link-card__description">
                    {isFolder ? `Marcadores: ${folder?.bookmarks || 0}` : (bookmark?.descripcion || 'Sin descripción')}
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