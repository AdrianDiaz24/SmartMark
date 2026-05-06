import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import FilterBar from '../components/FilterBar';
import GridCard from '../components/GridCard';
import LinkCard from '../components/LinkCard';
import { bookmarksService } from '../services/bookmarksService';
import { tagsService } from '../services/tagsService';
import './BookmarksPage.css';

function BookmarksPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tagName, setTagName] = useState(null);

    const activeFolder = searchParams.get('carpeta');
    const activeTag = searchParams.get('tag');
    const [viewMode, setViewMode] = useState('grid');

    // Cargar nombre del tag si hay filtro activo
    useEffect(() => {
        if (activeTag) {
            loadTagName();
        } else {
            setTagName(null);
        }
    }, [activeTag]);

    // Cargar marcadores al cambiar filtros
    useEffect(() => {
        loadBookmarks();
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

    const loadBookmarks = async () => {
        try {
            setLoading(true);
            let data;
            
            if (activeTag) {
                // Si hay un tag seleccionado, filtrar por tag
                data = await bookmarksService.getByTag(activeTag);
            } else {
                // Si hay una carpeta, filtrar por carpeta
                data = await bookmarksService.getAll(
                    activeFolder && activeFolder !== 'todas' ? { categoria_id: activeFolder } : {}
                );
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
                activeFolder={activeFolder}
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
                        <p>Cargando marcadores...</p>
                    ) : error ? (
                        <p style={{ color: 'red' }}>Error: {error}</p>
                    ) : bookmarks.length > 0 ? (
                        bookmarks.map((bookmark) => (
                            viewMode === 'grid' ? (
                                <GridCard key={bookmark.id} bookmark={bookmark} />
                            ) : (
                                <LinkCard key={bookmark.id} bookmark={bookmark} />
                            )
                        ))
                    ) : (
                        <p>No hay marcadores disponibles</p>
                    )}
                </section>
            </main>

        </div>
    );
}

export default BookmarksPage;