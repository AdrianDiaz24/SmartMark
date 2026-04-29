import React from 'react';
import './DeleteModal.css';

function DeleteTagModal({ isOpen, onClose, tagName }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <section className="modal-content modal-content--delete" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal__title">Eliminar tag</h2>

                <p className="delete-modal__text">
                    Usted esta apunto de eliminar su tag <strong>({tagName})</strong>, esta accion es irreversible,
                    sus marcadores continuaran estando disponibles, a menos que eligas la eliminancion de estas tambien.
                    ¿Estas seguro que desea eliminar el tag?
                </p>

                <div className="delete-modal__actions">
                    <button className="delete-modal__btn delete-modal__btn--danger">
                        Eliminar tag y marcadores
                    </button>
                    <button className="delete-modal__btn delete-modal__btn--danger">
                        Eliminar tag
                    </button>
                    <button className="delete-modal__btn delete-modal__btn--cancel" onClick={onClose}>
                        Cancelar
                    </button>
                </div>
            </section>
        </div>
    );
}

export default DeleteTagModal;