import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import FolderItem from './FolderItem';
import CreateFolderModal from './CreateFolderModal';
import CreateTagModal from './CreateTagModal';
import TagBadge from './TagBadge';
import { tagsService } from '../services/tagsService';
import { categoriesService } from '../services/categoriesService';
import './Sidebar.css';

import iconoAñadir from '../assets/Img/añadir_carpeta.png';
import iconoCarpeta from '../assets/Img/carpeta.png';
import iconoArchivador from '../assets/Img/archivador.png';

function Sidebar() {
    const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
    const [isTagModalOpen, setIsTagModalOpen] = useState(false);
    const [tags, setTags] = useState([]);
    const [tagsLoading, setTagsLoading] = useState(true);
    const [folders, setFolders] = useState([]);
    const [foldersLoading, setFoldersLoading] = useState(true);

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const activeFolder = searchParams.get('carpeta');
    const activeTag = searchParams.get('tag');

    // Cargar tags y carpetas al montar
    useEffect(() => {
        loadTags();
        loadFolders();
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

    const loadFolders = async () => {
        try {
            setFoldersLoading(true);
            const data = await categoriesService.getAll();
            setFolders(data || []);
        } catch (error) {
            console.error('Error cargando carpetas:', error);
            setFolders([]);
        } finally {
            setFoldersLoading(false);
        }
    };

    const handleFilter = (tipo, valor) => {
        navigate(`/todos?${tipo}=${valor}`);
    };

    const handleCreateFolder = async (folderData) => {
        try {
            await categoriesService.create(folderData);
            await loadFolders(); // Recargar carpetas
            setIsFolderModalOpen(false);
        } catch (error) {
            console.error('Error creando carpeta:', error);
            alert('Error al crear carpeta: ' + error.message);
        }
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

    const renderFolders = (foldersList) => {
        return foldersList.map(folder => (
            <div 
                key={folder.id} 
                onClick={(e) => {
                    e.stopPropagation();
                    handleFilter('carpeta', folder.id);
                }} 
                style={{ opacity: activeFolder === String(folder.id) ? 1 : 0.6, cursor: 'pointer' }}
            >
                <FolderItem 
                    icono={iconoCarpeta} 
                    titulo={folder.nombre} 
                    contador={folder.bookmarks || 0}
                />
                {folder.children && folder.children.length > 0 && (
                    <div style={{ marginLeft: '20px' }}>
                        {renderFolders(folder.children)}
                    </div>
                )}
            </div>
        ));
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
                    {foldersLoading ? (
                        <p style={{ fontSize: '12px', color: '#999', padding: '10px' }}>Cargando carpetas...</p>
                    ) : folders.length > 0 ? (
                        renderFolders(folders)
                    ) : (
                        <p style={{ fontSize: '12px', color: '#999', padding: '10px' }}>Sin carpetas</p>
                    )}
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

            <CreateFolderModal 
                isOpen={isFolderModalOpen} 
                onClose={() => setIsFolderModalOpen(false)}
                onCreateFolder={handleCreateFolder}
            />
            <CreateTagModal 
                isOpen={isTagModalOpen} 
                onClose={() => setIsTagModalOpen(false)}
                onCreateTag={handleCreateTag}
            />

        </aside>
    );
}

export default Sidebar;