import React, { useState, useEffect } from 'react';
import TagBadge from './TagBadge';
import TagPopover from './TagPopover';
import { bookmarksService } from '../services/bookmarksService';
import { tagsService } from '../services/tagsService';
import { categoriesService } from '../services/categoriesService';
import { useToast } from '../hooks/useToast';
import './CreateBookmarkModal.css';

function CreateBookmarkModal({ isOpen, onClose, onBookmarkCreated, defaultFolderId }) {
    const toast = useToast();
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [selectedTagIds, setSelectedTagIds] = useState([]);
    const [tags, setTags] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [scrapingUrl, setScrapingUrl] = useState(null);
    const [scrapingToastId, setScrapingToastId] = useState(null);
    const [gitHubData, setGitHubData] = useState(null); // Almacena datos de GitHub
    
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
            // Inicializar categoria_id con defaultFolderId si está disponible
            setFormData(prev => ({
                ...prev,
                categoria_id: defaultFolderId || ''
            }));
            loadTags();
            loadCategories();
        } else {
            // Limpiar toast al cerrar el modal
            if (scrapingToastId) {
                toast.removeToast?.(scrapingToastId);
                setScrapingToastId(null);
            }
        }
    }, [isOpen, defaultFolderId]);

    // Web scraping
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (formData.url.trim() && formData.url.startsWith('http')) {
                performScrape(formData.url.trim());
            }
        }, 1000); // Espera 1 segundo después de que el usuario deje de escribir

        return () => clearTimeout(debounceTimer);
    }, [formData.url]);

    // Mostrar bloqueo inmediatamente al detectar URL
    useEffect(() => {
        const hasUrl = formData.url.trim() && formData.url.startsWith('http');
        
        if (hasUrl && !scrapingToastId) {
            // Mostrar toast inmediatamente cuando hay URL
            const toastId = toast.info('Buscando metadatos…', 3000);
            setScrapingToastId(toastId);
        } else if (!hasUrl && scrapingToastId) {
            // Ocultar toast si se borra la URL
            toast.removeToast?.(scrapingToastId);
            setScrapingToastId(null);
        }
    }, [formData.url]);

    // Extender duración del toast mientras hay scraping en progreso
    useEffect(() => {
        if (scrapingUrl && scrapingToastId) {
            // Si hay scraping activo y hay un toast, mantener el toast visible
            // No hacer nada, el toast ya debería estar visible
        } else if (!scrapingUrl && scrapingToastId && (formData.url.trim() && formData.url.startsWith('http'))) {
            // Scraping completado, mantener el toast 3 segundos más
            const timerId = setTimeout(() => {
                toast.removeToast?.(scrapingToastId);
                setScrapingToastId(null);
            }, 3000);
            return () => clearTimeout(timerId);
        }
    }, [scrapingUrl]);

    const performScrape = async (url) => {
        try {
            setScrapingUrl(url);
            const result = await bookmarksService.scrapeUrl(url);
            
            if (result.success) {
                // Actualizar título y descripción
                setFormData(prev => ({
                    ...prev,
                    titulo: result.titulo,
                    descripcion: result.descripcion
                }));

                // Guardar datos de GitHub si existen
                if (result.gitHubData) {
                    console.log('[Frontend] Datos de GitHub encontrados:', result.gitHubData);
                    setGitHubData(result.gitHubData);
                } else {
                    setGitHubData(null);
                }

                // Aplicar tags automáticos si los hay
                if (result.autoTags && result.autoTags.length > 0) {
                    console.log('[Frontend] Tags detectados automáticamente:', result.autoTags);
                    setSelectedTagIds(result.autoTags);
                    // Mostrar notificación de tags detectados (solo si tags ya está cargado)
                    if (tags && tags.length > 0) {
                        const tagsNombres = tags
                            .filter(t => result.autoTags.includes(t.id))
                            .map(t => t.nombre)
                            .join(', ');
                        if (tagsNombres) {
                            console.log(`[Frontend] Tags aplicados: ${tagsNombres}`);
                        }
                    }
                } else {
                    console.log('[Frontend] No se detectaron tags automáticamente');
                }
            }
        } catch (err) {
            console.error('Error en scraping:', err);
        } finally {
            setScrapingUrl(null);
        }
    };

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

    // Función para aplanar las carpetas y mostrar todas incluyendo subcarpetas
    const flattenCategories = (cats, prefix = '') => {
        let result = [];
        (cats || []).forEach(cat => {
            result.push({
                ...cat,
                displayName: prefix + cat.nombre
            });
            if (cat.children && cat.children.length > 0) {
                result = result.concat(flattenCategories(cat.children, prefix + '  '));
            }
        });
        return result;
    };

    if (!isOpen) return null;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleClose = () => {
        // Limpiar formulario antes de cerrar
        setFormData({
            url: '',
            titulo: '',
            descripcion: '',
            portada: null,
            categoria_id: defaultFolderId || '',
            portadaPreview: null
        });
        setSelectedTagIds([]);
        setGitHubData(null);
        setError(null);
        
        // Limpiar toast
        if (scrapingToastId) {
            toast.removeToast?.(scrapingToastId);
            setScrapingToastId(null);
        }
        
        // Cerrar modal
        onClose();
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
            toast.error('URL y nombre son requeridos');
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

            // Agregar datos de GitHub si existen
            if (gitHubData) {
                submitData.append('github_stars', gitHubData.stars || 0);
                submitData.append('github_forks', gitHubData.forks || 0);
                submitData.append('github_watchers', gitHubData.watchers || 0);
                if (gitHubData.languages && gitHubData.languages.length > 0) {
                    submitData.append('github_languages', JSON.stringify(gitHubData.languages));
                }
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
            setGitHubData(null);
            
            // Disparar evento global para notificar que se creó un marcador
            window.dispatchEvent(new CustomEvent('bookmarkCreated', { detail: newBookmark }));
            
            // Notificar al padre
            if (onBookmarkCreated) {
                onBookmarkCreated(newBookmark);
            }
            
            toast.success('Marcador creado correctamente');
            onClose();
        } catch (err) {
            console.error('Error creando marcador:', err);
            toast.error(err.message || 'Error al crear el marcador');
        } finally {
            setLoading(false);
        }
    };

    const selectedTags = tags.filter(tag => selectedTagIds.includes(tag.id));

    return (
        <div className="modal-overlay" onMouseDown={handleClose}>
            <section className="modal-content modal-content--large" onMouseDown={(e) => e.stopPropagation()} aria-labelledby="bookmark-modal-title">

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
                            disabled={scrapingUrl !== null}
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
                            disabled={scrapingUrl !== null}
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
                                {flattenCategories(categories).map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.displayName}
                                    </option>
                                ))}
                            </select>
                            <span className="modal__help-text">Por defecto, el marcador se<br/>guardara en la seccion general</span>
                        </div>
                    </div>

                    <div className="modal__field modal__field--inline">
                         <label>Tags: 
                             {selectedTagIds.length > 0 && (
                                 <span style={{ fontSize: '12px', color: '#666', marginLeft: '8px' }}>
                                     ({selectedTagIds.length} seleccionado{selectedTagIds.length !== 1 ? 's' : ''})
                                 </span>
                             )}
                         </label>

                         <div className="modal__selected-tags">
                             {selectedTags.length > 0 ? (
                                 selectedTags.map(tag => (
                                     <TagBadge 
                                         key={tag.id} 
                                         texto={tag.nombre} 
                                         colorHex={tag.color} 
                                         isSelected={false} 
                                     />
                                 ))
                             ) : (
                                 <span style={{ fontSize: '13px', color: '#999' }}>Sin tags seleccionados</span>
                             )}
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