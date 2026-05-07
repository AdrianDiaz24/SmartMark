import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import FilterBar from '../components/FilterBar';
import GridCard from '../components/GridCard';
import LinkCard from '../components/LinkCard';
import { bookmarksService } from '../services/bookmarksService';
import { tagsService } from '../services/tagsService';
import { categoriesService } from '../services/categoriesService';
import './BookmarksPage.css';

function BookmarksPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [bookmarks, setBookmarks] = useState([]);
    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tagName, setTagName] = useState(null);
    const [folderName, setFolderName] = useState(null);

    const activeFolder = searchParams.get('carpeta');
    const activeTag = searchParams.get('tag');
    const [viewMode, setViewMode] = useState('grid');

    // Cargar nombre del tag y carpeta si hay filtros activos
    useEffect(() => {
        if (activeTag) {
            loadTagName();
        } else {
            setTagName(null);
        }

        if (activeFolder && activeFolder !== 'todas') {
            loadFolderName();
        } else {
            setFolderName(null);
        }
    }, [activeFolder, activeTag]);

    // Cargar marcadores al cambiar filtros
    useEffect(() => {
        loadBookmarks();
        loadFolders();
    }, [activeFolder, activeTag]);

    const loadTagName = async () => {
        try {
            const tag = await tagsService.getById(activeTag);
            if (tag) {
                setTagName(tag.nombre);
            }
        } catch (error) {
            console.error('Error cargando nombre del tag:', error);
        }
    };

    const loadFolderName = async () => {
        try {
            const folder = await categoriesService.getById(activeFolder);
            if (folder) {
                setFolderName(folder.nombre);
            }
        } catch (error) {
            console.error('Error cargando nombre de la carpeta:', error);
        }
    };

    const loadFolders = async () => {
        try {
            const allCategories = await categoriesService.getAll();
            let displayFolders = [];

            if (activeFolder && activeFolder !== 'todas') {
                // Si hay un filtro de carpeta activo, mostrar solo las subcarpetas
                const parentCategory = await categoriesService.getById(activeFolder);
                displayFolders = parentCategory?.children || [];
            } else if (activeTag) {
                // Si hay un filtro de tag, mostrar solo las carpetas de primer nivel que tengan ese tag
                displayFolders = (allCategories || []).filter(folder => 
                    folder.tags && folder.tags.some(tag => tag.id === parseInt(activeTag))
                );
            } else {
                // Si no hay filtro, mostrar solo las carpetas de primer nivel
                displayFolders = allCategories || [];
            }

            setFolders(displayFolders);
        } catch (error) {
            console.error('Error cargando carpetas:', error);
            setFolders([]);
        }
    };

    const loadBookmarks = async () => {
        try {
            setLoading(true);
            let data;
            
            if (activeTag) {
                // Si hay un tag seleccionado, filtrar por tag
                data = await bookmarksService.getByTag(activeTag);
            } else if (activeFolder && activeFolder !== 'todas') {
                // Si hay una carpeta, filtrar por carpeta (usar categoria_id)
                data = await bookmarksService.getAll({ categoria_id: activeFolder });
            } else {
                // Si no hay filtros, obtener todos
                data = await bookmarksService.getAll({});
            }
            
            setBookmarks(data || []);
            setError(null);
        } catch (err) {
            console.error('Error cargando marcadores:', err);
            setError(err.message);
            setBookmarks([]);
        } finally {
            setLoading(false);
        }
    };

    const clearFolderFilter = () => {
        if (activeTag) navigate(`/todos?tag=${activeTag}`);
        else navigate('/todos');
    };

    const clearTagFilter = () => {
        if (activeFolder) navigate(`/todos?carpeta=${activeFolder}`);
        else navigate('/todos');
    };

    return (
        <div className="bookmarks-page-wrapper">

            <FilterBar
                activeFolder={folderName || activeFolder}
                activeTag={tagName || activeTag}
                clearFolderFilter={clearFolderFilter}
                clearTagFilter={clearTagFilter}
                viewMode={viewMode}
                setViewMode={setViewMode}
            />

            <main className="app-layout">
                <Sidebar />

                <section className={`cards-container ${viewMode === 'grid' ? 'cards-container--grid' : 'cards-container--list'}`}>
                    {loading ? (
                        <p>Cargando...</p>
                    ) : error ? (
                        <p style={{ color: 'red' }}>Error: {error}</p>
                    ) : (
                        <>
                            {folders.length > 0 && (
                                <>
                                    {folders.map((folder) => (
                                        viewMode === 'grid' ? (
                                            <GridCard key={`folder-${folder.id}`} folder={folder} />
                                        ) : (
                                            <LinkCard key={`folder-${folder.id}`} folder={folder} />
                                        )
                                    ))}
                                </>
                            )}
                            {bookmarks.length > 0 && (
                                <>
                                    {bookmarks.map((bookmark) => (
                                        viewMode === 'grid' ? (
                                            <GridCard key={`bookmark-${bookmark.id}`} bookmark={bookmark} />
                                        ) : (
                                            <LinkCard key={`bookmark-${bookmark.id}`} bookmark={bookmark} />
                                        )
                                    ))}
                                </>
                            )}
                            {folders.length === 0 && bookmarks.length === 0 && (
                                <p>No hay elementos disponibles</p>
                            )}
                        </>
                    )}
                </section>
            </main>

        </div>
    );
}

export default BookmarksPage;