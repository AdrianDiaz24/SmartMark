import React from 'react';
import './DeleteModal.css';

function DeleteBookmarkModal({ isOpen, onClose, bookmarkName }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <section className="modal-content modal-content--delete" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal__title">Eliminar marcador</h2>

                <p className="delete-modal__text">
                    Usted esta apunto de eliminar su marcador <strong>({bookmarkName})</strong>, esta accion es irreversible.
                    ¿Estas seguro que desea eliminar este marcador permanentemente?
                </p>

                <div className="delete-modal__actions">
                    <button className="delete-modal__btn delete-modal__btn--danger">
                        Eliminar marcador
                    </button>
                    <button className="delete-modal__btn delete-modal__btn--cancel" onClick={onClose}>
                        Cancelar
                    </button>
                </div>
            </section>
        </div>
    );
}

export default DeleteBookmarkModal;