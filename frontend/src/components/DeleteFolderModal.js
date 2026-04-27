import React from 'react';
import './DeleteFolderModal.css';

function DeleteFolderModal({ isOpen, onClose, folderName }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <section className="modal-content modal-content--delete" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal__title">Eliminar carpeta</h2>

                <p className="delete-modal__text">
                    Usted esta apunto de eliminar su carpeta <strong>({folderName})</strong>, esta accion es irreversible,
                    sus marcadores seran movidos a la carpeta padre, a menos que eligas la eliminancion de estas tambien.
                    ¿Estas seguro que desea eliminar la carpeta?
                </p>

                <div className="delete-modal__actions">
                    <button className="delete-modal__btn delete-modal__btn--danger">
                        Eliminar carpeta y marcadores
                    </button>
                    <button className="delete-modal__btn delete-modal__btn--danger">
                        Eliminar carpeta
                    </button>
                    <button className="delete-modal__btn delete-modal__btn--cancel" onClick={onClose}>
                        Cancelar
                    </button>
                </div>
            </section>
        </div>
    );
}

export default DeleteFolderModal;