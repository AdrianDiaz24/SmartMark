import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ManageBookmark from './ManageBookmark';
import QuickActionsPanel from './QuickActionsPanel';
import DeleteBookmarkModal from './DeleteBookmarkModal';
import SearchResultsPanel from './SearchResultsPanel';
import { bookmarksService } from '../services/bookmarksService';
import { categoriesService } from '../services/categoriesService';
import { tagsService } from '../services/tagsService';
import { useToast } from '../hooks/useToast';
import './ManageBookmarksContent.css';

function ManageBookmarksContent() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const toast = useToast();
    const [bookmarks, setBookmarks] = useState([]);
    const [editedBookmark, setEditedBookmark] = useState(null);
    const [originalData, setOriginalData] = useState(null);
    const [unsavedChangesToastId, setUnsavedChangesToastId] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [folders, setFolders] = useState([]);
    const [allTags, setAllTags] = useState([]);
    const [updating, setUpdating] = useState(false);

    // Cargar bookmarks, carpetas y tags al montar el componente
    useEffect(() => {
        loadBookmarks();
        loadFolders();
        loadTags();

        // Limpiar toast al desmontar
        return () => {
            if (unsavedChangesToastId) {
                toast.removeToast?.(unsavedChangesToastId);
            }
        };
    }, []);

    // Seleccionar el bookmark según el parámetro de URL o el primero si no hay
    useEffect(() => {
        const bookmarkIdFromUrl = searchParams.get('id');
        
        if (bookmarkIdFromUrl) {
            // Si hay un ID en la URL, cargar ese marcador específico
            loadSpecificBookmark(parseInt(bookmarkIdFromUrl, 10));
        } else if (bookmarks.length > 0 && !editedBookmark) {
            // Si no hay ID en URL, seleccionar el primer marcador de la lista
            setEditedBookmark(bookmarks[0]);
            setOriginalData(JSON.parse(JSON.stringify(bookmarks[0])));
        }
    }, [bookmarks, searchParams]);

    // Detectar cambios en el bookmark editado
    useEffect(() => {
        if (!editedBookmark || !originalData) {
            return;
        }

        // Convertir ambos a JSON para comparación exacta
        try {
            const editedStr = JSON.stringify({
                titulo: editedBookmark.titulo,
                url: editedBookmark.url,
                descripcion: editedBookmark.descripcion,
                categoria_id: editedBookmark.categoria_id,
                tags: (editedBookmark.tags || []).map(t => t.id).sort(),
                portada: editedBookmark.portada,
                id: editedBookmark.id
            });
            
            const originalStr = JSON.stringify({
                titulo: originalData.titulo,
                url: originalData.url,
                descripcion: originalData.descripcion,
                categoria_id: originalData.categoria_id,
                tags: (originalData.tags || []).map(t => t.id).sort(),
                portada: originalData.portada,
                id: originalData.id
            });

            const hasChanges = editedStr !== originalStr;

            if (hasChanges) {
                // Si hay cambios y no hay toast, mostrar
                if (!unsavedChangesToastId) {
                    const toastId = toast.warning('Cambios sin guardar', 3000);
                    setUnsavedChangesToastId(toastId);
                }
            } else {
                // Si no hay cambios y hay un toast, ocultarlo
                if (unsavedChangesToastId) {
                    toast.removeToast?.(unsavedChangesToastId);
                    setUnsavedChangesToastId(null);
                }
            }
        } catch (err) {
            console.error('Error al comparar cambios:', err);
        }
    }, [editedBookmark, originalData]);

    const loadBookmarks = async () => {
        try {
            setLoading(true);
            const data = await bookmarksService.getAll({ all: true });
            setBookmarks(data || []);
            if (error) setError(null);
        } catch (err) {
            console.error('Error cargando marcadores:', err);
            setError(err.message);
            setBookmarks([]);
        } finally {
            setLoading(false);
        }
    };

    const loadSpecificBookmark = async (bookmarkId) => {
        try {
            // Cargar el marcador específico por ID
            const bookmark = await bookmarksService.getById(bookmarkId);
            if (bookmark) {
                setEditedBookmark(bookmark);
                setOriginalData(JSON.parse(JSON.stringify(bookmark)));
            } else {
                // Si no existe, usar el primero de la lista
                if (bookmarks.length > 0) {
                    setEditedBookmark(bookmarks[0]);
                    setOriginalData(JSON.parse(JSON.stringify(bookmarks[0])));
                }
            }
        } catch (err) {
            console.error('Error cargando marcador específico:', err);
            // Fallback: usar el primero de la lista
            if (bookmarks.length > 0) {
                setEditedBookmark(bookmarks[0]);
                setOriginalData(JSON.parse(JSON.stringify(bookmarks[0])));
            }
        }
    };

    const loadFolders = async () => {
        try {
            const data = await categoriesService.getAll();
            setFolders(data || []);
        } catch (err) {
            console.error('Error cargando carpetas:', err);
            setFolders([]);
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
            setAllTags(tagsWithNumericIds);
        } catch (err) {
            console.error('Error cargando tags:', err);
            setAllTags([]);
        }
    };

    const handleInputChange = (field, value) => {
        setEditedBookmark({ ...editedBookmark, [field]: value });
    };

    const handleFileChange = (file) => {
        setEditedBookmark({ ...editedBookmark, portadaFile: file });
    };

    const handleToggleTag = (tagId) => {
        const currentTags = editedBookmark.tags || [];
        const isAlreadySelected = currentTags.some(t => t.id === tagId);

        let newTags;
        if (isAlreadySelected) {
            newTags = currentTags.filter(t => t.id !== tagId);
        } else {
            const tagToAdd = allTags.find(t => t.id === tagId);
            if (tagToAdd) {
                newTags = [...currentTags, tagToAdd];
            } else {
                newTags = currentTags;
            }
        }

        setEditedBookmark({ ...editedBookmark, tags: newTags });
    };

    const handleUpdate = async () => {
        try {
            if (!editedBookmark.titulo || editedBookmark.titulo.trim() === '') {
                toast.error('El nombre del marcador no puede estar vacío');
                return;
            }

            setUpdating(true);

            // Preparar datos para actualizar
            const submitData = new FormData();
            submitData.append('titulo', editedBookmark.titulo.trim());
            submitData.append('url', editedBookmark.url || '');
            submitData.append('descripcion', editedBookmark.descripcion || '');
            
            if (editedBookmark.portadaFile) {
                submitData.append('portada', editedBookmark.portadaFile);
            }
            
            // Siempre enviar categoria_id, incluso si es vacío/null (para sección general)
            submitData.append('categoria_id', editedBookmark.categoria_id || '');

            // Agregar tags
            const tagIds = editedBookmark.tags?.map(t => t.id) || [];
            if (tagIds.length > 0) {
                submitData.append('tags', JSON.stringify(tagIds));
            }

            const updatedBookmark = await bookmarksService.update(editedBookmark.id, submitData);

            // Actualizar la lista con los datos del servidor
            const updatedBookmarks = bookmarks.map(b => 
                b.id === editedBookmark.id ? updatedBookmark : b
            );
            setBookmarks(updatedBookmarks);
            
            // Sincronizar: hacer copia profunda sin portadaFile para que sean idénticos
            const cleanUpdateBookmark = JSON.parse(JSON.stringify(updatedBookmark));
            setEditedBookmark(cleanUpdateBookmark);
            
            // Limpiar toast de cambios sin guardar
            if (unsavedChangesToastId) {
                toast.removeToast?.(unsavedChangesToastId);
                setUnsavedChangesToastId(null);
            }
            
            // Actualizar datos originales con la misma copia
            setOriginalData(JSON.parse(JSON.stringify(cleanUpdateBookmark)));
            
            toast.success('Marcador actualizado correctamente');
        } catch (err) {
            console.error('Error actualizando marcador:', err);
            toast.error(`Error al actualizar: ${err.message}`);
        } finally {
            setUpdating(false);
        }
    };

    const handleVisitWebpage = () => {
        let finalUrl = editedBookmark.url;
        if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
            finalUrl = 'https://' + finalUrl;
        }
        window.open(finalUrl, '_blank', 'noopener,noreferrer');
    };

    const handleDelete = async () => {
        try {
            await bookmarksService.delete(editedBookmark.id);
            
            setIsDeleteModalOpen(false);
            toast.success('Marcador eliminado correctamente');
            
            // Navegar a HomePage después de eliminar
            navigate('/');
        } catch (err) {
            console.error('Error eliminando marcador:', err);
            toast.error(`Error al eliminar: ${err.message}`);
        }
    };

    const handleRemovePortada = async () => {
        try {
            setUpdating(true);
            
            // Limpiar inmediatamente en el frontend
            const cleanedBookmark = {
                ...editedBookmark,
                portada: null
            };
            setEditedBookmark(cleanedBookmark);
            
            // Preparar datos para actualizar sin portada
            const submitData = new FormData();
            submitData.append('titulo', editedBookmark.titulo.trim());
            submitData.append('url', editedBookmark.url || '');
            submitData.append('descripcion', editedBookmark.descripcion || '');
            submitData.append('portada', ''); // Vaciar portada
            
            if (editedBookmark.categoria_id) {
                submitData.append('categoria_id', editedBookmark.categoria_id);
            }

            // Agregar tags
            const tagIds = editedBookmark.tags?.map(t => t.id) || [];
            if (tagIds.length > 0) {
                submitData.append('tags', JSON.stringify(tagIds));
            }

            const updatedBookmark = await bookmarksService.update(editedBookmark.id, submitData);

            // Actualizar la lista con los datos del servidor
            const updatedBookmarks = bookmarks.map(b => 
                b.id === editedBookmark.id ? updatedBookmark : b
            );
            setBookmarks(updatedBookmarks);
            
            // Sincronizar: hacer copia profunda para que sean idénticos
            const cleanUpdateBookmark = JSON.parse(JSON.stringify(updatedBookmark));
            setEditedBookmark(cleanUpdateBookmark);
            
            // Limpiar toast de cambios sin guardar
            if (unsavedChangesToastId) {
                toast.removeToast?.(unsavedChangesToastId);
                setUnsavedChangesToastId(null);
            }
            
            // Actualizar datos originales con la misma copia
            setOriginalData(JSON.parse(JSON.stringify(cleanUpdateBookmark)));
            
            toast.success('Portada eliminada correctamente');
        } catch (err) {
            console.error('Error eliminando portada:', err);
            toast.error(`Error al eliminar portada: ${err.message}`);
            // Revertir el cambio en caso de error
            loadBookmarks();
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="manage-page-layout">
                <div className="manage-header">
                    <h2>Gestiona tus marcadores</h2>
                </div>
                <p style={{ padding: '20px' }}>Cargando marcadores...</p>
            </div>
        );
    }

    if (bookmarks.length === 0) {
        return (
            <div className="manage-page-layout">
                <div className="manage-header">
                    <h2>Gestiona tus marcadores</h2>
                </div>
                <p style={{ padding: '20px' }}>No hay marcadores disponibles</p>
            </div>
        );
    }

    return (
        <div className="manage-page-layout">
            <div className="manage-header">
                <h2>Gestiona tu marcador</h2>
            </div>

            {error && (
                <div style={{ color: 'red', padding: '20px', backgroundColor: '#ffebee', margin: '10px' }}>
                    Error: {error}
                </div>
            )}

            <SearchResultsPanel />

            {editedBookmark && (
                <div className="manage-content manage-content--2-cols">
                    <ManageBookmark
                        bookmark={editedBookmark}
                        onChange={handleInputChange}
                        onFileChange={handleFileChange}
                        availableFolders={folders}
                        systemTags={allTags}
                        onToggleTag={handleToggleTag}
                        onRemovePortada={handleRemovePortada}
                    />

                    <QuickActionsPanel
                        viewButtonText="Visitar página web"
                        onUpdate={handleUpdate}
                        onView={handleVisitWebpage}
                        onDelete={() => setIsDeleteModalOpen(true)}
                        isLoading={updating}
                    />
                </div>
            )}

            <DeleteBookmarkModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                bookmarkName={editedBookmark?.titulo || 'sin nombre'}
                onDelete={handleDelete}
            />
        </div>
    );
}

export default ManageBookmarksContent;