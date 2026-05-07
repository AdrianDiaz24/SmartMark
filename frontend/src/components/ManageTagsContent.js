import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ManageSidebarTag from './ManageSidebarTag';
import ManageTagCenter from './ManageTagCenter';
import QuickActionsPanel from './QuickActionsPanel';
import DeleteTagModal from './DeleteTagModal';
import CreateTagModal from './CreateTagModal';
import { tagsService } from '../services/tagsService';
import './ManageFoldersContent.css';

function ManageTagsContent() {
    const [tags, setTags] = useState([]);
    const [selectedTag, setSelectedTag] = useState(null);
    const [editedTag, setEditedTag] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Cargar tags al montar el componente
    useEffect(() => {
        loadTags();
    }, []);

    // Seleccionar primer tag cuando se carguen
    useEffect(() => {
        if (tags.length > 0 && !selectedTag) {
            handleSelectTag(tags[0]);
        }
    }, [tags]);

    const loadTags = async () => {
        try {
            setLoading(true);
            const data = await tagsService.getAll();
            setTags(data || []);
            if (error) setError(null);
        } catch (err) {
            console.error('Error cargando tags:', err);
            setError(err.message);
            setTags([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectTag = async (tag) => {
        setSelectedTag(tag);
        try {
            // Cargar el tag con estadísticas
            const tagWithStats = await tagsService.getById(tag.id);
            setEditedTag(tagWithStats);
        } catch (error) {
            console.error('Error cargando estadísticas del tag:', error);
            setEditedTag({ ...tag });
        }
    };

    const handleInputChange = (field, value) => {
        setEditedTag({ ...editedTag, [field]: value });
    };

    const handleUpdate = async () => {
        try {
            if (!editedTag.nombre || editedTag.nombre.trim() === '') {
                alert('El nombre del tag no puede estar vacío');
                return;
            }

            await tagsService.update(editedTag.id, {
                nombre: editedTag.nombre,
                color: editedTag.color
            });

            // Actualizar la lista
            const updatedTags = tags.map(t => 
                t.id === editedTag.id ? editedTag : t
            );
            setTags(updatedTags);
            setSelectedTag(editedTag);
            
            alert('Tag actualizado correctamente');
        } catch (err) {
            console.error('Error actualizando tag:', err);
            alert(`Error al actualizar: ${err.message}`);
        }
    };

    const handleViewContent = () => {
        if (selectedTag) {
            navigate(`/todos?tag=${selectedTag.id}`);
        }
    };

    const handleDelete = async () => {
        try {
            await tagsService.delete(selectedTag.id);
            
            // Eliminar de la lista
            const updatedTags = tags.filter(t => t.id !== selectedTag.id);
            setTags(updatedTags);
            
            // Seleccionar otro tag o limpiar
            if (updatedTags.length > 0) {
                setSelectedTag(updatedTags[0]);
                setEditedTag(updatedTags[0]);
            } else {
                setSelectedTag(null);
                setEditedTag(null);
            }

            setIsDeleteModalOpen(false);
            alert('Tag eliminado correctamente');
        } catch (err) {
            console.error('Error eliminando tag:', err);
            alert(`Error al eliminar: ${err.message}`);
        }
    };

    const handleCreateTag = async (tagData) => {
        try {
            const newTag = await tagsService.create(tagData);
            setTags([...tags, newTag]);
            setIsCreateModalOpen(false);
            alert('Tag creado correctamente');
        } catch (err) {
            console.error('Error creando tag:', err);
            alert(`Error al crear: ${err.message}`);
        }
    };

    if (loading) {
        return (
            <div className="manage-page-layout">
                <div className="manage-header">
                    <h2>Gestiona tus tags</h2>
                </div>
                <p style={{ padding: '20px' }}>Cargando tags...</p>
            </div>
        );
    }

    return (
        <div className="manage-page-layout">
            <div className="manage-header">
                <h2>Gestiona tus tags</h2>
            </div>

            {error && (
                <div style={{ color: 'red', padding: '20px', backgroundColor: '#ffebee', margin: '10px' }}>
                    Error: {error}
                </div>
            )}

            <div className="manage-content">
                <ManageSidebarTag
                    title="Tags"
                    items={tags}
                    selectedId={selectedTag?.id}
                    onSelect={handleSelectTag}
                    onAdd={() => setIsCreateModalOpen(true)}
                />

                {selectedTag && editedTag && (
                    <>
                        <ManageTagCenter
                            tag={editedTag}
                            onChange={handleInputChange}
                        />

                        <QuickActionsPanel
                            viewButtonText="Ver contenido"
                            onUpdate={handleUpdate}
                            onView={handleViewContent}
                            onDelete={() => setIsDeleteModalOpen(true)}
                        />
                    </>
                )}
            </div>

            <DeleteTagModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                tagName={selectedTag?.nombre || 'sin nombre'}
                onConfirmDelete={handleDelete}
            />

            <CreateTagModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreateTag={handleCreateTag}
            />
        </div>
    );
}

export default ManageTagsContent;