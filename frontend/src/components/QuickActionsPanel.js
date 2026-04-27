import React from 'react';
import './QuickActionsPanel.css';

function QuickActionsPanel({
                               onUpdate,
                               onView,
                               onDelete,
                               viewButtonText = "Ver contenido" // Por defecto dice esto, pero se puede cambiar
                           }) {
    return (
        <aside className="quick-actions">
            <div className="manage-card manage-card--actions">
                <h3 className="manage-card__title">Acciones rapidas</h3>
                <button className="manage-btn manage-btn--light" onClick={onUpdate}>
                    Actualizar
                </button>
                <button className="manage-btn manage-btn--light" onClick={onView}>
                    {viewButtonText}
                </button>
                <button className="manage-btn manage-btn--danger" onClick={onDelete}>
                    Eliminar
                </button>
            </div>
        </aside>
    );
}

export default QuickActionsPanel;