import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import FilterBar from '../components/FilterBar';
import GridCard from '../components/GridCard';
import LinkCard from '../components/LinkCard';
import CreateBookmarkModal from '../components/CreateBookmarkModal';
import { useSearch } from '../context/SearchContext';
import { bookmarksService } from '../services/bookmarksService';
import { tagsService } from '../services/tagsService';
import { categoriesService } from '../services/categoriesService';
import './BookmarksPage.css';

function BookmarksPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { searchTerm: contextSearchTerm } = useSearch();
    const [bookmarks, setBookmarks] = useState([]);
    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tagName, setTagName] = useState(null);
    const [folderName, setFolderName] = useState(null);
    const [isCreateBookmarkModalOpen, setIsCreateBookmarkModalOpen] = useState(false);

    const activeFolder = searchParams.get('carpeta');
    const activeTag = searchParams.get('tag');
    const urlSearchTerm = searchParams.get('search');
    const searchTerm = (contextSearchTerm && contextSearchTerm.trim()) ? contextSearchTerm : urlSearchTerm;
    const [viewMode, setViewMode] = useState('grid');
    const [searchName, setSearchName] = useState(null);

    // Cargar nombre del tag, carpeta y búsqueda si hay filtros activos
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

        if (searchTerm) {
            setSearchName(searchTerm);
        } else {
            setSearchName(null);
        }
    }, [activeFolder, activeTag, searchTerm]);

    // Cargar marcadores al cambiar filtros
    useEffect(() => {
        // Si el cambio es solo en el contexto de búsqueda, usar debounce
        if (contextSearchTerm && contextSearchTerm.trim()) {
            const timeoutId = setTimeout(() => {
                loadBookmarks();
                loadFolders();
            }, 300);
            return () => clearTimeout(timeoutId);
        } else {
            // Para cambios en URL o filtros, cargar inmediatamente
            loadBookmarks();
            loadFolders();
        }
    }, [activeFolder, activeTag, searchTerm, contextSearchTerm]);

    // Recargar datos
    useEffect(() => {
        const handleFocus = () => {
            loadBookmarks();
            loadFolders();
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, []);

    // Recargar datos cuando se crea un marcador
    useEffect(() => {
        const handleBookmarkCreated = () => {
            loadBookmarks();
            loadFolders();
        };

        window.addEventListener('bookmarkCreated', handleBookmarkCreated);
        return () => window.removeEventListener('bookmarkCreated', handleBookmarkCreated);
    }, []);

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

    const filterFoldersByTag = (folders, tagId) => {
        return folders.filter(folder => 
            folder.tags && folder.tags.some(tag => tag.id === parseInt(tagId))
        );
    };

    const filterFoldersBySearch = (folders, search) => {
        const lowerSearch = search.toLowerCase();
        return folders.filter(folder => 
            folder.nombre.toLowerCase().includes(lowerSearch) ||
            (folder.tags && folder.tags.some(tag => tag.nombre.toLowerCase().includes(lowerSearch)))
        );
    };

    const loadFolders = async () => {
        try {
            const allCategories = await categoriesService.getAll();
            let displayFolders = [];

            if (activeFolder && activeFolder !== 'todas') {
                // Si hay un filtro de carpeta activo, mostrar solo las subcarpetas
                const parentCategory = await categoriesService.getById(activeFolder);
                displayFolders = parentCategory?.children || [];
            } else {
                // Si no hay filtro de carpeta, mostrar carpetas de primer nivel
                displayFolders = allCategories || [];
            }

            // Si hay un filtro de tag, aplicarlo a las carpetas que se mostrarán
            if (activeTag) {
                displayFolders = filterFoldersByTag(displayFolders, activeTag);
            }

            // Si hay búsqueda, aplicarla a las carpetas que se mostrarán
            if (searchTerm) {
                displayFolders = filterFoldersBySearch(displayFolders, searchTerm);
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
            
            // Construir filtros basados en los parámetros
            const filters = {};
            
            if (activeFolder && activeFolder !== 'todas') {
                filters.categoria_id = activeFolder;
            }
            
            if (activeTag) {
                filters.tag_id = activeTag;
            }

            if (searchTerm) {
                filters.search = searchTerm;
            }
            
            // Si hay filtros, aplicarlos; si no, obtener todos
            if (Object.keys(filters).length > 0) {
                data = await bookmarksService.getAll(filters);
            } else {
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
        const params = new URLSearchParams();
        if (activeTag) params.set('tag', activeTag);
        if (searchTerm) params.set('search', searchTerm);
        navigate(`/todos?${params.toString()}` || '/todos');
    };

    const clearTagFilter = () => {
        const params = new URLSearchParams();
        if (activeFolder) params.set('carpeta', activeFolder);
        if (searchTerm) params.set('search', searchTerm);
        navigate(`/todos?${params.toString()}` || '/todos');
    };

    const clearSearchFilter = () => {
        const params = new URLSearchParams();
        if (activeFolder) params.set('carpeta', activeFolder);
        if (activeTag) params.set('tag', activeTag);
        navigate(`/todos?${params.toString()}` || '/todos');
    };

    const handleBookmarkCreated = (newBookmark) => {
        // Recargar tanto marcadores como carpetas para asegurar que todo está sincronizado
        loadBookmarks();
        loadFolders();
        // Cerrar el modal
        setIsCreateBookmarkModalOpen(false);
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
                activeSearch={searchTerm}
                clearSearchFilter={clearSearchFilter}
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

            <CreateBookmarkModal
                isOpen={isCreateBookmarkModalOpen}
                onClose={() => setIsCreateBookmarkModalOpen(false)}
                onBookmarkCreated={handleBookmarkCreated}
            />

        </div>
    );
}

export default BookmarksPage;