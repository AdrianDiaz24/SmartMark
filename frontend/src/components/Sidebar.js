import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import FolderItem from './FolderItem';
import CreateFolderModal from './CreateFolderModal';
import CreateTagModal from './CreateTagModal';
import TagBadge from './TagBadge';
import { tagsService } from '../services/tagsService';
import './Sidebar.css';

import iconoAñadir from '../assets/Img/añadir_carpeta.png';
import iconoCarpeta from '../assets/Img/carpeta.png';
import iconoArchivador from '../assets/Img/archivador.png';

function Sidebar() {
    const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
    const [isTagModalOpen, setIsTagModalOpen] = useState(false);
    const [tags, setTags] = useState([]);
    const [tagsLoading, setTagsLoading] = useState(true);

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const activeFolder = searchParams.get('carpeta');
    const activeTag = searchParams.get('tag');

    // Cargar tags al montar
    useEffect(() => {
        loadTags();
    }, []);

    const loadTags = async () => {
        try {
            setTagsLoading(true);
            const data = await tagsService.getAll();
            setTags(data || []);
        } catch (error) {
            console.error('Error cargando tags:', error);
            setTags([]);
        } finally {
            setTagsLoading(false);
        }
    };

    const handleFilter = (tipo, valor) => {
        navigate(`/todos?${tipo}=${valor}`);
    };

    const handleCreateTag = async (tagData) => {
        try {
            await tagsService.create(tagData);
            await loadTags(); // Recargar tags
            setIsTagModalOpen(false);
        } catch (error) {
            console.error('Error creando tag:', error);
            alert('Error al crear tag: ' + error.message);
        }
    };

    return (
        <aside className="sidebar-container">

            <div className="sidebar-block">
                <div className="sidebar__header">

                    <h3
                        className="sidebar__title sidebar__title--clickable"
                        onClick={() => navigate('/gestionar-carpetas')}
                        title="Ir a gestionar carpetas"
                    >
                        Carpetas
                    </h3>
                    <button className="sidebar__add-btn" onClick={() => setIsFolderModalOpen(true)}>
                        <img src={iconoAñadir} alt="Añadir carpeta" className="sidebar__add-icon" />
                    </button>
                </div>

                <div className="sidebar__list">
                    <div onClick={() => handleFilter('carpeta', 'todas')} style={{ opacity: activeFolder === 'todas' ? 1 : 0.6, cursor: 'pointer' }}>
                        <FolderItem icono={iconoArchivador} titulo="Todos los marcadores" contador="" />
                    </div>
                    <div onClick={() => handleFilter('carpeta', 'carpeta1')} style={{ opacity: activeFolder === 'carpeta1' ? 1 : 0.6, cursor: 'pointer' }}>
                        <FolderItem icono={iconoCarpeta} titulo="Carpeta 1" contador="" subcarpetas={["Subcarpeta 1", "Subcarpeta 2"]} />
                    </div>
                    <div onClick={() => handleFilter('carpeta', 'carpeta2')} style={{ opacity: activeFolder === 'carpeta2' ? 1 : 0.6, cursor: 'pointer' }}>
                        <FolderItem icono={iconoCarpeta} titulo="Carpeta 2" contador="" />
                    </div>
                    <div onClick={() => handleFilter('carpeta', 'carpeta3')} style={{ opacity: activeFolder === 'carpeta3' ? 1 : 0.6, cursor: 'pointer' }}>
                        <FolderItem icono={iconoCarpeta} titulo="Carpeta 3" contador="" />
                    </div>
                </div>
            </div>


            <div className="sidebar-block">
                <div className="sidebar__header">
                    <h3
                        className="sidebar__title sidebar__title--clickable"
                        onClick={() => navigate('/gestionar-tags')}
                        title="Ir a gestionar tags"
                    >
                        Tags
                    </h3>
                    <button className="sidebar__add-btn" onClick={() => setIsTagModalOpen(true)} style={{ fontSize: '18px', padding: '0 8px' }}>
                        +
                    </button>
                </div>
                <div className="sidebar__tags-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {tagsLoading ? (
                        <p style={{ fontSize: '12px', color: '#999' }}>Cargando...</p>
                    ) : tags.length > 0 ? (
                        tags.map(tag => (
                            <TagBadge
                                key={tag.id}
                                texto={tag.nombre}
                                colorHex={tag.color}
                                isSelected={activeTag === String(tag.id)}
                                onClick={() => handleFilter('tag', String(tag.id))}
                            />
                        ))
                    ) : (
                        <p style={{ fontSize: '12px', color: '#999' }}>Sin tags</p>
                    )}
                </div>
            </div>

            <CreateFolderModal isOpen={isFolderModalOpen} onClose={() => setIsFolderModalOpen(false)} />
            <CreateTagModal 
                isOpen={isTagModalOpen} 
                onClose={() => setIsTagModalOpen(false)}
                onCreateTag={handleCreateTag}
            />

        </aside>
    );
}

export default Sidebar;