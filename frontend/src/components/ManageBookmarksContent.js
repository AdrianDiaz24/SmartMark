import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ManageBookmark from './ManageBookmark';
import QuickActionsPanel from './QuickActionsPanel';
import DeleteBookmarkModal from './DeleteBookmarkModal';
import { bookmarksService } from '../services/bookmarksService';
import { categoriesService } from '../services/categoriesService';
import { tagsService } from '../services/tagsService';
import './ManageBookmarksContent.css';

function ManageBookmarksContent() {
    const [searchParams] = useSearchParams();
    const [bookmarks, setBookmarks] = useState([]);
    const [editedBookmark, setEditedBookmark] = useState(null);
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
    }, []);

    // Seleccionar el bookmark según el parámetro de URL o el primero si no hay
    useEffect(() => {
        if (bookmarks.length > 0 && !editedBookmark) {
            const bookmarkIdFromUrl = searchParams.get('id');
            if (bookmarkIdFromUrl) {
                const selectedBookmark = bookmarks.find(b => b.id === parseInt(bookmarkIdFromUrl, 10));
                if (selectedBookmark) {
                    setEditedBookmark(selectedBookmark);
                } else {
                    setEditedBookmark(bookmarks[0]);
                }
            } else {
                setEditedBookmark(bookmarks[0]);
            }
        }
    }, [bookmarks, searchParams]);

    const loadBookmarks = async () => {
        try {
            setLoading(true);
            const data = await bookmarksService.getAll();
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
                alert('El nombre del marcador no puede estar vacío');
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
            setEditedBookmark(updatedBookmark);
            
            alert('Marcador actualizado correctamente');
        } catch (err) {
            console.error('Error actualizando marcador:', err);
            alert(`Error al actualizar: ${err.message}`);
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
            
            // Eliminar de la lista
            const updatedBookmarks = bookmarks.filter(b => b.id !== editedBookmark.id);
            setBookmarks(updatedBookmarks);
            
            // Seleccionar otro bookmark o limpiar
            if (updatedBookmarks.length > 0) {
                setEditedBookmark(updatedBookmarks[0]);
            } else {
                setEditedBookmark(null);
            }

            setIsDeleteModalOpen(false);
            alert('Marcador eliminado correctamente');
        } catch (err) {
            console.error('Error eliminando marcador:', err);
            alert(`Error al eliminar: ${err.message}`);
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

            {editedBookmark && (
                <div className="manage-content manage-content--2-cols">
                    <ManageBookmark
                        bookmark={editedBookmark}
                        onChange={handleInputChange}
                        onFileChange={handleFileChange}
                        availableFolders={folders}
                        systemTags={allTags}
                        onToggleTag={handleToggleTag}
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