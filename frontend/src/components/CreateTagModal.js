import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './CreateTagModal.css';


const TAG_COLORS = [
    'FF4343', '51986C', '593DF9', '33A4DC',
    'FFE943', 'F93DDD', '33DCCB', '616060'
];

function CreateTagModal({ isOpen, onClose, onCreateTag }) {

    const [tagName, setTagName] = useState('');
    const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0]); // Por defecto el primero (rojo)
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (tagName.trim() === '') {
            alert('Por favor, introduce un nombre para el tag.');
            return;
        }

        setIsLoading(true);

        try {
            if (onCreateTag) {
                await onCreateTag({
                    nombre: tagName.trim(),
                    color: selectedColor
                });
            }

            // Limpiar formulario
            setTagName('');
            setSelectedColor(TAG_COLORS[0]);
        } catch (error) {
            console.error('Error creando tag:', error);
            alert('Error al crear el tag: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const modalContent = (
        <div className="modal-overlay" onClick={(e) => { e.stopPropagation(); onClose(); }}>
            <section className="modal-content modal-content--tag" onClick={(e) => e.stopPropagation()}>

                <h2 className="modal__title">Crear tag</h2>

                <form onSubmit={handleSubmit} className="modal__form">

                    {}
                    <div className="modal__field">
                        <label htmlFor="tag-name">Nombre</label>
                        <input
                            id="tag-name"
                            type="text"
                            placeholder="Introduzca el nombre del tag"
                            className="modal__input"
                            value={tagName}
                            onChange={(e) => setTagName(e.target.value)}
                            required
                        />
                    </div>

                    {}
                    <div className="modal__field">
                        <label>Color</label>
                        <div className="modal__color-grid">
                            {TAG_COLORS.map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    className={`modal__color-swatch ${selectedColor === color ? 'modal__color-swatch--selected' : ''}`}
                                    style={{ backgroundColor: `#${color}` }}
                                    onClick={() => setSelectedColor(color)}
                                    aria-label={`Seleccionar color #${color}`}
                                />
                            ))}
                        </div>
                    </div>

                    {}
                    <div className="modal__actions modal__actions--right">
                        <button 
                            type="submit" 
                            className="modal__submit-btn"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creando...' : 'Crear'}
                        </button>
                    </div>

                </form>
            </section>
        </div>
    );

    return ReactDOM.createPortal(modalContent, document.body);
}

export default CreateTagModal;