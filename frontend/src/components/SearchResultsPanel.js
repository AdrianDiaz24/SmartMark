import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../context/SearchContext';
import { bookmarksService } from '../services/bookmarksService';
import './SearchResultsPanel.css';

function SearchResultsPanel() {
    const navigate = useNavigate();
    const { searchTerm, isSearching } = useSearch();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    // Ejecutar búsqueda en tiempo real
    useEffect(() => {
        if (searchTerm.trim() && isSearching) {
            performSearch();
        } else {
            setResults([]);
        }
    }, [searchTerm, isSearching]);

    const performSearch = async () => {
        try {
            setLoading(true);
            const searchResults = await bookmarksService.getAll({
                search: searchTerm
            });
            setResults(searchResults || []);
        } catch (err) {
            console.error('Error en búsqueda:', err);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    if (!isSearching) {
        return null;
    }

    return (
        <div className="search-results-panel">
            <div className="search-results-panel__header">
                <h3 className="search-results-panel__title">
                    Resultados: {results.length} marcador{results.length !== 1 ? 'es' : ''}
                </h3>
            </div>

            <div className="search-results-panel__list">
                {loading ? (
                    <p className="search-results-panel__loading">Buscando...</p>
                ) : results.length > 0 ? (
                    results.map(bookmark => (
                        <div
                            key={bookmark.id}
                            className="search-results-panel__item"
                            onClick={() => navigate(`/gestionar-marcadores?id=${bookmark.id}`)}
                        >
                            <div className="search-results-panel__item-content">
                                <h4 className="search-results-panel__item-title">
                                    {bookmark.titulo}
                                </h4>
                                <p className="search-results-panel__item-url">
                                    {bookmark.url}
                                </p>
                            </div>
                            <span className="search-results-panel__item-arrow">→</span>
                        </div>
                    ))
                ) : (
                    <p className="search-results-panel__empty">
                        No se encontraron marcadores
                    </p>
                )}
            </div>
        </div>
    );
}

export default SearchResultsPanel;

