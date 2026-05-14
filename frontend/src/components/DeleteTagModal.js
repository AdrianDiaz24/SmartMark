import React from 'react';
import './DeleteModal.css';

function DeleteTagModal({ isOpen, onClose, tagName, onConfirmDelete }) {
    if (!isOpen) return null;

    const handleDelete = () => {
        if (onConfirmDelete) {
            onConfirmDelete();
        }
    };

    return (
        <div className="modal-overlay" onMouseDown={onClose}>
            <section className="modal-content modal-content--delete" onMouseDown={(e) => e.stopPropagation()}>
                <h2 className="modal__title">Eliminar tag</h2>

                <p className="delete-modal__text">
                    Usted está apunto de eliminar su tag <strong>({tagName})</strong>, esta acción es irreversible.
                    Sus marcadores continuarán estando disponibles sin este tag.
                    ¿Estás seguro que desea eliminar el tag?
                </p>

                <div className="delete-modal__actions">
                    <button 
                        className="delete-modal__btn delete-modal__btn--danger"
                        onClick={handleDelete}
                    >
                        Eliminar tag
                    </button>
                    <button 
                        className="delete-modal__btn delete-modal__btn--cancel" 
                        onClick={onClose}
                    >
                        Cancelar
                    </button>
                </div>
            </section>
        </div>
    );
}

export default DeleteTagModal;