import React from 'react';
import ReactDOM from 'react-dom';
import './DeleteModal.css';

function DeleteFolderModal({ isOpen, onClose, folderName, onDelete }) {
    if (!isOpen) return null;

    const handleDeleteFolderOnly = () => {
        if (onDelete) {
            onDelete(false);
        }
        onClose();
    };

    const handleDeleteFolderAndBookmarks = () => {
        if (onDelete) {
            onDelete(true);
        }
        onClose();
    };

    const modalContent = (
        <div className="modal-overlay" onMouseDown={onClose}>
            <section className="modal-content modal-content--delete" onMouseDown={(e) => e.stopPropagation()}>
                <h2 className="modal__title">Eliminar carpeta</h2>

                <p className="delete-modal__text">
                    Usted esta apunto de eliminar su carpeta <strong>({folderName})</strong>, esta accion es irreversible,
                    sus marcadores seran movidos a la carpeta padre, a menos que eligas la eliminancion de estas tambien.
                    ¿Estas seguro que desea eliminar la carpeta?
                </p>

                <div className="delete-modal__actions">
                    <button className="delete-modal__btn delete-modal__btn--danger" onClick={handleDeleteFolderAndBookmarks}>
                        Eliminar carpeta y marcadores
                    </button>
                    <button className="delete-modal__btn delete-modal__btn--danger" onClick={handleDeleteFolderOnly}>
                        Eliminar carpeta
                    </button>
                    <button className="delete-modal__btn delete-modal__btn--cancel" onClick={onClose}>
                        Cancelar
                    </button>
                </div>
            </section>
        </div>
    );

    return ReactDOM.createPortal(modalContent, document.body);
}

export default DeleteFolderModal;