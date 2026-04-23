import React from 'react';
import './FilterBar.css';

function FilterBar({ activeFolder, activeTag, clearFolderFilter, clearTagFilter, viewMode, setViewMode }) {
    return (
        <div className="filter-bar-container">
            <div className="filter-bar__left">
                {activeFolder && activeFolder !== 'todas' && (
                    <span className="filter-pill folder-pill" onClick={clearFolderFilter}>
            Carpeta: {activeFolder}
          </span>
                )}

                {activeTag && (
                    <span className="filter-pill tag-pill" onClick={clearTagFilter}>
            Tag: {activeTag}
          </span>
                )}

                <input type="text" placeholder="Buscar tags" className="filter-search" />
            </div>

            <div className="filter-bar__right">
                <button
                    className={`view-toggle-btn ${viewMode === 'grid' ? 'view-toggle-btn--active' : ''}`}
                    onClick={() => setViewMode('grid')}
                >
                    Cuadricula
                </button>
                <button
                    className={`view-toggle-btn ${viewMode === 'list' ? 'view-toggle-btn--active' : ''}`}
                    onClick={() => setViewMode('list')}
                >
                    Lista
                </button>
            </div>
        </div>
    );
}

export default FilterBar;