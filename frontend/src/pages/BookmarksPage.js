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
    }, [activeFolder, activeTag, searchTerm]);

    // Cargar marcadores al cambiar filtros
    useEffect(() => {
        // Si el cambio es solo en el contexto de búsqueda, usar debounce
        if (contextSearchTerm && contextSearchTerm.trim()) {
            const timeoutId = setTimeout(() => {
                loadBookmarks();
            }, 300);
            return () => clearTimeout(timeoutId);
        } else {
            // Para cambios en URL o filtros, cargar inmediatamente
            loadBookmarks();
        }
    }, [activeFolder, activeTag, searchTerm, contextSearchTerm]);

    // Recargar datos cuando la ventana vuelve a tener foco
    useEffect(() => {
        const handleFocus = () => {
            loadBookmarks();
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [activeFolder, activeTag, searchTerm]);

    // Recargar datos cuando se crea un marcador
    useEffect(() => {
        const handleBookmarkCreated = () => {
            loadBookmarks();
        };

        window.addEventListener('bookmarkCreated', handleBookmarkCreated);
        return () => window.removeEventListener('bookmarkCreated', handleBookmarkCreated);
    }, [activeFolder, activeTag, searchTerm]);

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

    const handleBookmarkCreated = () => {
        // Recargar marcadores para asegurar que todo está sincronizado
        loadBookmarks();
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
                            {bookmarks.length === 0 && (
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
                defaultFolderId={activeFolder}
            />

        </div>
    );
}

export default BookmarksPage;