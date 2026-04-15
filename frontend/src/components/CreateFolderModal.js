import React from "react";
import './CreateFolderModal.css';

function CreateFolderModal({isOpen, onClose}) {

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>

            <section className="modal-content" onClick={(e) => e.stopPropagation()} aria-labelledby="modal-title">

                <h2 id="modal-title" className="modal__title">Crear carpeta</h2>

                <form onSubmit={handleSubmit}>

                    <div className="modal__field">
                        <label htmlFor="folder-name">Nombre</label>
                        <input
                            id="folder-name"
                            type="text"
                            placeholder="Introduzca el nombre de la carpeta"
                            className="modal__input"
                        />
                    </div>

                    <div className="modal__field">
                        <label htmlFor="parent-folder">Carpeta padre</label>
                        <select id="parent-folder" className="modal__select" defaultValue="">
                            <option value="" disabled>Seleccione la carpeta padre</option>
                            <option value="general">General (Todos los marcadores)</option>
                            <option value="carpeta1">Carpeta 1</option>
                            <option value="carpeta2">Carpeta 2</option>
                        </select>
                        <span className="modal__help-text">Por defecto la carpeta padre sera la general</span>
                    </div>

                    <div className="modal__field modal__field--inline">
                        <label>Tags:</label>
                        {/* El type="button" evita que este botón envíe el formulario por accidente */}
                        <button type="button" className="modal__add-tag-btn">+</button>
                    </div>

                    <div className="modal__actions">
                        {/* Al ser type="submit", cuando el usuario haga clic, disparará el onSubmit del form */}
                        <button type="submit" className="modal__submit-btn">Crear</button>
                    </div>

                </form>
            </section>
        </div>
    );
}

export default CreateFolderModal;
