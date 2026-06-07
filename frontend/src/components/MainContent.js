import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useSearch } from '../context/SearchContext';
import StatCard from './StatCard';
import LinkCard from './LinkCard';
import { bookmarksService } from '../services/bookmarksService';
import { categoriesService } from '../services/categoriesService';
import { tagsService } from '../services/tagsService';
import './MainContent.css';

function MainContent() {
    const navigate = useNavigate();
    const { searchTerm, setSearchResults, isSearching } = useSearch();
    const [bookmarks, setBookmarks] = useState([]);
    const [searchResults, setLocalSearchResults] = useState([]);
    const [stats, setStats] = useState({
        totalBookmarks: 0,
        totalCategories: 0,
        totalTags: 0,
        visitedLastWeek: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadData = async () => {
        try {
            setLoading(true);
            
            // Cargar todos los datos en paralelo
            const [bookmarksData, categoriesData, tagsData, countLastWeek, countAll, totalCategoriesCount] = await Promise.all([
                bookmarksService.getRecentBookmarks(),
                categoriesService.getAll(),
                tagsService.getAll(),
                bookmarksService.countVisitedLastWeek(),
                bookmarksService.countAllBookmarks(),
                categoriesService.getTotalCount()
            ]);

            setBookmarks(bookmarksData || []);
            setStats({
                totalBookmarks: countAll?.count || 0,
                totalCategories: totalCategoriesCount?.total || 0,
                totalTags: Array.isArray(tagsData) ? tagsData.length : 0,
                visitedLastWeek: countLastWeek?.count || 0
            });
        } catch (err) {
            console.error('Error cargando datos:', err);
            setError(err.message);
            // Mantener datos por defecto si hay error
            setBookmarks([]);
        } finally {
            setLoading(false);
        }
    };

    // Ejecutar búsqueda en tiempo real
    useEffect(() => {
        if (searchTerm.trim()) {
            const performSearch = async () => {
                try {
                    const results = await bookmarksService.getAll({
                        search: searchTerm
                    });
                    setLocalSearchResults(results || []);
                    setSearchResults(results || []);
                } catch (err) {
                    console.error('Error en búsqueda:', err);
                    setLocalSearchResults([]);
                }
            };

            // Ejecutar búsqueda con pequeño delay para evitar demasiadas llamadas
            const timeoutId = setTimeout(performSearch, 300);
            return () => clearTimeout(timeoutId);
        } else {
            setLocalSearchResults([]);
            setSearchResults([]);
        }
    }, [searchTerm, setSearchResults]);

    useEffect(() => {
        loadData();
        
        // Actualizar datos de GitHub en background (sin bloquear la UI)
        console.log('[GitHub Refresh] Iniciando actualización automática de GitHub');
        bookmarksService.refreshGitHubData()
            .then(result => {
                console.log('[GitHub Refresh] Resultado:', result);
                // Recargar datos después de actualizar GitHub
                loadData();
            })
            .catch(err => {
                console.error('[GitHub Refresh] Error:', err);
                // No mostrar error al usuario, es solo una actualización en background
            });
    }, []);

    // Recargar datos cuando la ventana vuelve a estar en foco
    useEffect(() => {
        const handleFocus = () => {
            loadData();
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, []);

    // Recargar datos cuando se crea un marcador, tag o carpeta
    useEffect(() => {
        const handleBookmarkCreated = () => {
            loadData();
        };

        const handleTagCreated = () => {
            loadData();
        };

        const handleFolderCreated = () => {
            loadData();
        };

        window.addEventListener('bookmarkCreated', handleBookmarkCreated);
        window.addEventListener('tagCreated', handleTagCreated);
        window.addEventListener('folderCreated', handleFolderCreated);
        
        return () => {
            window.removeEventListener('bookmarkCreated', handleBookmarkCreated);
            window.removeEventListener('tagCreated', handleTagCreated);
            window.removeEventListener('folderCreated', handleFolderCreated);
        };
    }, []);

    return (
        <section className="main-content">

            <div className="main-content__stats-board">
                <StatCard titulo="Marcadores totales" contador={`${stats.totalBookmarks} links`} />
                <StatCard titulo="Carpetas totales" contador={stats.totalCategories} />
                <StatCard titulo="Tags totales" contador={stats.totalTags} />
                <StatCard titulo="Marcadores visitados la ultima semana" contador={stats.visitedLastWeek} />
            </div>

            {error && (
                <div style={{ color: 'red', padding: '10px', marginBottom: '10px' }}>
                    Error al cargar datos: {error}
                </div>
            )}

            {/* Sección de Resultados de Búsqueda */}
            {isSearching && (
                <section className="main-content__results" aria-labelledby="results-title">
                    <div className="main-content__results-header">
                        <h2 id="results-title" className="main-content__results-title">
                            Resultados de búsqueda
                        </h2>
                        <span className="main-content__results-count">
                            {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    <div className="main-content__results-list">
                        {searchResults.length > 0 ? (
                            searchResults.map(bookmark => (
                                <LinkCard
                                    key={`search-${bookmark.id}`}
                                    bookmark={bookmark}
                                />
                            ))
                        ) : (
                            <p style={{ color: '#999', padding: '20px', textAlign: 'center' }}>
                                No se encontraron marcadores
                            </p>
                        )}
                    </div>
                </section>
            )}

            <section className="main-content__recent" aria-labelledby="recent-title">
                <div className="main-content__recent-header">
                    <h2 id="recent-title" className="main-content__recent-title">Recientes</h2>

                    <button
                        className="main-content__ver-todo-btn"
                        onClick={() => navigate('/todos')}
                    >
                        Ver todo
                    </button>
                </div>

                <div className="main-content__recent-list">
                    {loading ? (
                        <p>Cargando marcadores...</p>
                    ) : bookmarks.length > 0 ? (
                        bookmarks.map(bookmark => (
                            <LinkCard
                                key={bookmark.id}
                                bookmark={bookmark}
                            />
                        ))
                    ) : (
                        <p>No hay marcadores disponibles. ¡Crea uno nuevo!</p>
                    )}
                </div>
            </section>

        </section>
    );
}

export default MainContent;