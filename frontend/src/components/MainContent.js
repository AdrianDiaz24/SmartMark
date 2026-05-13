import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import StatCard from './StatCard';
import LinkCard from './LinkCard';
import { bookmarksService } from '../services/bookmarksService';
import { categoriesService } from '../services/categoriesService';
import { tagsService } from '../services/tagsService';
import './MainContent.css';

function MainContent() {
    const navigate = useNavigate();
    const [bookmarks, setBookmarks] = useState([]);
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
            const [bookmarksData, categoriesData, tagsData, countLastWeek] = await Promise.all([
                bookmarksService.getRecentBookmarks(),
                categoriesService.getAll(),
                tagsService.getAll(),
                bookmarksService.countVisitedLastWeek()
            ]);

            setBookmarks(bookmarksData || []);
            setStats({
                totalBookmarks: Array.isArray(bookmarksData) ? bookmarksData.length : 0,
                totalCategories: Array.isArray(categoriesData) ? categoriesData.length : 0,
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

    useEffect(() => {
        loadData();
    }, []);

    // Recargar datos cuando la ventana vuelve a estar en foco
    useEffect(() => {
        const handleFocus = () => {
            loadData();
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
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