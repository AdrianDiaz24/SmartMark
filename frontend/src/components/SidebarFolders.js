import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSidebar } from '../context/SidebarContext';
import CreateFolderModal from './CreateFolderModal';
import { categoriesService } from '../services/categoriesService';
import { useToast } from '../hooks/useToast';
import './Sidebar.css';

import iconoAñadir from '../assets/Img/añadir_carpeta.png';
import iconoCarpeta from '../assets/Img/carpeta.png';
import iconoArchivador from '../assets/Img/archivador.png';

function SidebarFolders() {
    const toast = useToast();
    const { isMenuOpen, closeMenu } = useSidebar();
    const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
    const [folders, setFolders] = useState([]);
    const [foldersLoading, setFoldersLoading] = useState(true);
    const [selectedFolderId, setSelectedFolderId] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        loadFolders();
    }, []);

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

    const handleCreateFolder = async (folderData) => {
        try {
            await categoriesService.create(folderData);
            toast.success(`Carpeta "${folderData.nombre}" creada correctamente`);
            await loadFolders();
            setIsFolderModalOpen(false);
        } catch (error) {
            console.error('Error creando carpeta:', error);
            toast.error('Error al crear carpeta: ' + error.message);
        }
    };

    const handleFolderClick = (folderId) => {
        setSelectedFolderId(folderId);
        closeMenu();
    };

    const renderFolders = (foldersList, isSubfolder = false) => {
        return foldersList.map(folder => (
            <React.Fragment key={folder.id}>
                <div
                    className={`sidebar-folder__item ${isSubfolder ? 'sidebar-folder__item--sub' : ''} ${selectedFolderId === folder.id ? 'active' : ''}`}
                    onClick={() => handleFolderClick(folder.id)}
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
                <div className="sidebar-folder">
                    <div className="sidebar-folder__header">
                        <h3>Carpetas</h3>
                        <button className="sidebar-folder__add-btn" onClick={() => setIsFolderModalOpen(true)}>
                            <img src={iconoAñadir} alt="Añadir carpeta" className="sidebar-folder__add-icon" />
                        </button>
                    </div>
                    <div className="sidebar-folder__list">
                        <div
                            className={`sidebar-folder__item ${selectedFolderId === null ? 'active' : ''}`}
                            onClick={() => handleFolderClick(null)}
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

                <CreateFolderModal 
                    isOpen={isFolderModalOpen} 
                    onClose={() => setIsFolderModalOpen(false)}
                    onCreateFolder={handleCreateFolder}
                />
            </aside>
        </>
    );
}

export default SidebarFolders;



