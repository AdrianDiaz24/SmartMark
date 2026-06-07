import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSidebar } from '../context/SidebarContext';
import CreateFolderModal from './CreateFolderModal';
import CreateTagModal from './CreateTagModal';
import TagBadge from './TagBadge';
import { tagsService } from '../services/tagsService';
import { categoriesService } from '../services/categoriesService';
import { useToast } from '../hooks/useToast';
import './Sidebar.css';

import iconoAñadir from '../assets/Img/añadir_carpeta.png';
import iconoCarpeta from '../assets/Img/carpeta.png';
import iconoArchivador from '../assets/Img/archivador.png';

function Sidebar() {
    const toast = useToast();
    const { isMenuOpen, closeMenu } = useSidebar();
    const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
    const [isTagModalOpen, setIsTagModalOpen] = useState(false);
    const [tags, setTags] = useState([]);
    const [tagsLoading, setTagsLoading] = useState(true);
    const [folders, setFolders] = useState([]);
    const [foldersLoading, setFoldersLoading] = useState(true);
    const [selectedFolderId, setSelectedFolderId] = useState(null);

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const activeFolder = searchParams.get('carpeta');
    const activeTag = searchParams.get('tag');

    // Cargar tags y carpetas al montar
    useEffect(() => {
        loadTags();
        loadFolders();
    }, []);

    // Actualizar folder seleccionada basada en URL
    useEffect(() => {
        if (activeFolder && activeFolder !== 'todas') {
            setSelectedFolderId(parseInt(activeFolder));
        } else {
            setSelectedFolderId(null);
        }
    }, [activeFolder]);

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
        // Obtener los parámetros actuales de la URL
        const currentParams = new URLSearchParams(window.location.search);
        
        if (tipo === 'carpeta' && valor === 'todas') {
            // Si selecciona "todas", remover el filtro de carpeta pero mantener el tag
            currentParams.delete('carpeta');
        } else {
            // Mantener otros parámetros y actualizar/agregar el nuevo
            currentParams.set(tipo, valor);
        }
        
        navigate(`/todos?${currentParams.toString()}`);
        // Cerrar menú en mobile/tablet
        closeMenu();
    };

    const handleCreateFolder = async (folderData) => {
        try {
            await categoriesService.create(folderData);
            toast.success(`Carpeta "${folderData.nombre}" creada correctamente`);
            await loadFolders(); // Recargar carpetas
            setIsFolderModalOpen(false);
        } catch (error) {
            console.error('Error creando carpeta:', error);
            toast.error('Error al crear carpeta: ' + error.message);
        }
    };

    const handleCreateTag = async (tagData) => {
        try {
            await tagsService.create(tagData);
            toast.success(`Tag "${tagData.nombre}" creado correctamente`);
            await loadTags(); // Recargar tags
            setIsTagModalOpen(false);
        } catch (error) {
            console.error('Error creando tag:', error);
            toast.error('Error al crear tag: ' + error.message);
        }
    };

    const renderFolders = (foldersList, isSubfolder = false) => {
        return foldersList.map(folder => (
            <React.Fragment key={folder.id}>
                <div
                    className={`sidebar-folder__item ${isSubfolder ? 'sidebar-folder__item--sub' : ''} ${selectedFolderId === folder.id ? 'active' : ''}`}
                    onClick={() => {
                        setSelectedFolderId(folder.id);
                        handleFilter('carpeta', folder.id);
                    }}
                >
                    {!isSubfolder && (
                        <img src={iconoCarpeta} alt="Carpeta" className="sidebar-folder__icon" />
                    )}
                    <span>{folder.nombre}</span>
                </div>

                {folder.children && folder.children.length > 0 && (
                    <div className="sidebar-folder__sublist">
                        {renderFolders(folder.children, true)}
                    </div>
                )}
            </React.Fragment>
        ));
    };

    return (
        <>
            <div className={`sidebar-overlay ${isMenuOpen ? 'sidebar-overlay--active' : ''}`} onClick={closeMenu}></div>

            <aside className={`sidebar-container ${isMenuOpen ? 'sidebar-container--open' : ''}`}>

                {/* SECCIÓN DE CARPETAS */}
                <div className="sidebar-folder" style={{ marginBottom: '20px' }}>
                    <div className="sidebar-folder__header">
                        <h3 
                            style={{ cursor: 'pointer' }}
                            onClick={() => navigate('/gestionar-carpetas')}
                            title="Click para gestionar carpetas"
                        >
                            Carpetas
                        </h3>
                        <button className="sidebar-folder__add-btn" onClick={() => setIsFolderModalOpen(true)}>
                            <img src={iconoAñadir} alt="Añadir carpeta" className="sidebar-folder__add-icon" />
                        </button>
                    </div>
                    <div className="sidebar-folder__list">
                        <div
                            className={`sidebar-folder__item ${selectedFolderId === null && !activeFolder ? 'active' : ''}`}
                            onClick={() => {
                                setSelectedFolderId(null);
                                handleFilter('carpeta', 'todas');
                            }}
                        >
                            <img src={iconoArchivador} alt="Sección general" className="sidebar-folder__icon" />
                            <span>Sección general</span>
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

                {/* SECCIÓN DE TAGS */}
                <div className="sidebar-tags">
                    <div className="sidebar-tags__header">
                        <h3 
                            style={{ cursor: 'pointer' }}
                            onClick={() => navigate('/gestionar-tags')}
                            title="Click para gestionar tags"
                        >
                            Tags
                        </h3>
                        <button className="sidebar-tags__add-btn" onClick={() => setIsTagModalOpen(true)}>
                            +
                        </button>
                    </div>
                    <div className="sidebar-tags__list">
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
        </>
    );
}

export default Sidebar;