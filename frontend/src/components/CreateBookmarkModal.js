import React, { useState, useEffect } from 'react';
import TagBadge from './TagBadge';
import TagPopover from './TagPopover';
import { bookmarksService } from '../services/bookmarksService';
import { tagsService } from '../services/tagsService';
import { categoriesService } from '../services/categoriesService';
import './CreateBookmarkModal.css';

function CreateBookmarkModal({ isOpen, onClose, onBookmarkCreated }) {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [selectedTagIds, setSelectedTagIds] = useState([]);
    const [tags, setTags] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const [formData, setFormData] = useState({
        url: '',
        titulo: '',
        descripcion: '',
        portada: null,
        categoria_id: '',
        portadaPreview: null
    });

    useEffect(() => {
        if (isOpen) {
            loadTags();
            loadCategories();
        }
    }, [isOpen]);

    const loadTags = async () => {
        try {
            const data = await tagsService.getAll();
            // Asegurar que los IDs de los tags sean números
            const tagsWithNumericIds = (data || []).map(tag => ({
                ...tag,
                id: parseInt(tag.id, 10)
            }));
            setTags(tagsWithNumericIds);
        } catch (err) {
            console.error('Error cargando tags:', err);
        }
    };

    const loadCategories = async () => {
        try {
            const data = await categoriesService.getAll();
            setCategories(data || []);
        } catch (err) {
            console.error('Error cargando carpetas:', err);
        }
    };

    if (!isOpen) return null;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const preview = URL.createObjectURL(file);
            setFormData({ ...formData, portada: file, portadaPreview: preview });
        }
    };

    const handleToggleTag = (tagId) => {
        setSelectedTagIds((prevIds) => {
            if (prevIds.includes(tagId)) {
                return prevIds.filter(id => id !== tagId);
            } else {
                return [...prevIds, tagId];
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.url.trim() || !formData.titulo.trim()) {
            setError('URL y nombre son requeridos');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Crear FormData para enviar con imagen
            const submitData = new FormData();
            submitData.append('titulo', formData.titulo.trim());
            submitData.append('url', formData.url.trim());
            submitData.append('descripcion', formData.descripcion.trim() || '');
            
            if (formData.portada) {
                submitData.append('portada', formData.portada);
            }
            
            if (formData.categoria_id) {
                submitData.append('categoria_id', formData.categoria_id);
            }

            // Agregar tags
            if (selectedTagIds.length > 0) {
                submitData.append('tags', JSON.stringify(selectedTagIds));
            }

            const newBookmark = await bookmarksService.create(submitData);
            
            console.log('Bookmark creado:', newBookmark);
            
            if (!newBookmark || !newBookmark.id) {
                throw new Error('No se recibió un marcador válido del servidor');
            }
            
            // Resetear formulario
            setFormData({
                url: '',
                titulo: '',
                descripcion: '',
                portada: null,
                categoria_id: '',
                portadaPreview: null
            });
            setSelectedTagIds([]);
            
            // Notificar al padre
            if (onBookmarkCreated) {
                onBookmarkCreated(newBookmark);
            }
            
            onClose();
        } catch (err) {
            console.error('Error creando marcador:', err);
            setError(err.message || 'Error al crear el marcador');
        } finally {
            setLoading(false);
        }
    };

    const selectedTags = tags.filter(tag => selectedTagIds.includes(tag.id));

    return (
        <div className="modal-overlay" onClick={onClose}>
            <section className="modal-content modal-content--large" onClick={(e) => e.stopPropagation()} aria-labelledby="bookmark-modal-title">

                <h2 id="bookmark-modal-title" className="visually-hidden">Crear nuevo marcador</h2>

                {error && (
                    <div style={{ color: 'red', backgroundColor: '#ffebee', padding: '10px', marginBottom: '10px', borderRadius: '4px' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="bookmark-form">

                    <div className="modal__field">
                        <label htmlFor="bookmark-url">URL</label>
                        <input 
                            id="bookmark-url" 
                            type="url" 
                            name="url"
                            placeholder="Introduzca la URL del sitio web" 
                            className="modal__input" 
                            value={formData.url}
                            onChange={handleInputChange}
                            required 
                        />
                    </div>

                    <div className="modal__field">
                        <label htmlFor="bookmark-name">Nombre</label>
                        <input 
                            id="bookmark-name" 
                            type="text" 
                            name="titulo"
                            placeholder="Introduzca el nombre del sitio web" 
                            className="modal__input" 
                            value={formData.titulo}
                            onChange={handleInputChange}
                            required 
                        />
                    </div>

                    <div className="modal__field">
                        <label htmlFor="bookmark-desc">Descripcion</label>
                        <textarea 
                            id="bookmark-desc" 
                            name="descripcion"
                            placeholder="Introduzca la descripcion del sitio web" 
                            className="modal__input modal__textarea"
                            value={formData.descripcion}
                            onChange={handleInputChange}
                        ></textarea>
                    </div>

                    <div className="modal__field modal__field--file">
                        <div className="modal__file-info">
                            <label>Portada</label>
                            <span className="modal__help-text">Eliga una imagen de portada (archivos permitidos: .png, .jpg, .svg)</span>
                        </div>
                        <label className="modal__upload-btn">
                            Subir imagen
                            <input 
                                type="file" 
                                accept=".png, .jpg, .jpeg, .svg" 
                                className="visually-hidden"
                                onChange={handleFileChange}
                            />
                        </label>
                        {formData.portadaPreview && (
                            <div style={{ marginTop: '10px' }}>
                                <img src={formData.portadaPreview} alt="Preview" style={{ maxWidth: '100px', maxHeight: '100px' }} />
                            </div>
                        )}
                    </div>

                    <div className="modal__field">
                        <label htmlFor="bookmark-folder">Carpeta</label>
                        <div className="modal__folder-row">
                            <select 
                                id="bookmark-folder" 
                                name="categoria_id"
                                className="modal__select modal__select--small"
                                value={formData.categoria_id}
                                onChange={handleInputChange}
                            >
                                <option value="">Sección general</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.nombre}
                                    </option>
                                ))}
                            </select>
                            <span className="modal__help-text">Por defecto, el marcador se<br/>guardara en la seccion general</span>
                        </div>
                    </div>

                    <div className="modal__field modal__field--inline">
                        <label>Tags:</label>

                        <div className="modal__selected-tags">
                            {selectedTags.map(tag => (
                                <TagBadge 
                                    key={tag.id} 
                                    texto={tag.nombre} 
                                    colorHex={tag.color} 
                                    isSelected={false} 
                                />
                            ))}
                        </div>

                        <button 
                            type="button" 
                            className="modal__add-tag-btn" 
                            onClick={() => setIsPopoverOpen(true)}
                        >
                            +
                        </button>

                        <TagPopover
                            isOpen={isPopoverOpen}
                            onClose={() => setIsPopoverOpen(false)}
                            availableTags={tags}
                            selectedTags={selectedTagIds}
                            onToggleTag={handleToggleTag}
                        />
                    </div>

                    <div className="modal__actions">
                        <button 
                            type="submit" 
                            className="modal__submit-btn"
                            disabled={loading}
                        >
                            {loading ? 'Creando...' : 'Crear'}
                        </button>
                    </div>

                </form>
            </section>
        </div>
    );
}

export default CreateBookmarkModal;