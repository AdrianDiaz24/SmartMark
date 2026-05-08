import React from 'react';
import './QuickActionsPanel.css';

function QuickActionsPanel({
                               onUpdate,
                               onView,
                               onDelete,
                               viewButtonText = "Ver contenido",
                               isLoading = false
                           }) {
    return (
        <aside className="quick-actions">
            <div className="manage-card manage-card--actions">
                <h3 className="manage-card__title">Acciones rapidas</h3>
                <button 
                    className="manage-btn manage-btn--light" 
                    onClick={onUpdate}
                    disabled={isLoading}
                >
                    {isLoading ? 'Guardando...' : 'Actualizar'}
                </button>
                <button 
                    className="manage-btn manage-btn--light" 
                    onClick={onView}
                    disabled={isLoading}
                >
                    {viewButtonText}
                </button>
                <button 
                    className="manage-btn manage-btn--danger" 
                    onClick={onDelete}
                    disabled={isLoading}
                >
                    Eliminar
                </button>
            </div>
        </aside>
    );
}

export default QuickActionsPanel;