import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ManageSidebarFolder from './ManageSidebarFolder';
import ManageFolderCenter from './ManageFolderCenter';
import QuickActionsPanel from './QuickActionsPanel';
import DeleteFolderModal from './DeleteFolderModal';
import CreateFolderModal from './CreateFolderModal';
import SearchResultsPanel from './SearchResultsPanel';
import { categoriesService } from '../services/categoriesService';
import { tagsService } from '../services/tagsService';
import { useToast } from '../hooks/useToast';
import './ManageFoldersContent.css';

function ManageFoldersContent() {
    const toast = useToast();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    const [folders, setFolders] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [editedFolder, setEditedFolder] = useState(null);
    const [originalData, setOriginalData] = useState(null);
    const [unsavedChangesToastId, setUnsavedChangesToastId] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [tags, setTags] = useState([]);

    const folderId = searchParams.get('id');

    // Cargar carpetas al montar
    useEffect(() => {
        loadFolders();
        loadTags();

        // Limpiar toast al desmontar (cuando se navega fuera de la página)
        return () => {
            if (unsavedChangesToastId) {
                toast.removeToast?.(unsavedChangesToastId);
            }
        };
    }, []);

    // Seleccionar la carpeta según el parámetro `id` o la primera carpeta
    useEffect(() => {
        if (folders.length > 0) {
            let folderToSelect = null;

            if (folderId) {
                // Si hay un ID en la URL, buscar esa carpeta
                folderToSelect = getAllFolders(folders).find(f => f.id === parseInt(folderId));
            }

            // Si no encontramos la carpeta por ID o no hay ID, seleccionar la primera
            if (!folderToSelect) {
                folderToSelect = getAllFolders(folders)[0];
            }

            if (folderToSelect) {
                handleSelectFolder(folderToSelect);
            }
        }
    }, [folders, folderId]);

    // Detectar cambios en la carpeta editada
    useEffect(() => {
        if (!editedFolder || !originalData) {
            return;
        }

        // Convertir ambos a JSON para comparación exacta
        try {
            const editedStr = JSON.stringify({
                name: editedFolder.name,
                parentId: editedFolder.parentId,
                id: editedFolder.id
            });
            
            const originalStr = JSON.stringify({
                name: originalData.name,
                parentId: originalData.parentId,
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
    }, [editedFolder, originalData]);

    const loadFolders = async () => {
        try {
            setIsLoading(true);
            const data = await categoriesService.getAll();
            setFolders(data || []);
        } catch (error) {
            console.error('Error cargando carpetas:', error);
            setFolders([]);
        } finally {
            setIsLoading(false);
        }
    };

    const loadTags = async () => {
        try {
            const data = await tagsService.getAll();
            setTags(data || []);
        } catch (error) {
            console.error('Error cargando tags:', error);
            setTags([]);
        }
    };

    const getAllFolders = (foldersList) => {
        let result = [];
        foldersList.forEach(folder => {
            result.push(folder);
            if (folder.children && folder.children.length > 0) {
                result = result.concat(getAllFolders(folder.children));
            }
        });
        return result;
    };

    const handleSelectFolder = (folder) => {
        setSelectedFolder(folder);
        // Transformar datos del backend al formato esperado por ManageFolderCenter
        const folderData = {
            ...folder,
            name: folder.nombre,
            parentId: folder.padre_id || null, // Guardar el ID del padre
            subfolders: folder.subfolders || 0,
            bookmarks: folder.bookmarks || 0,
            date: folder.fecha_creacion ? new Date(folder.fecha_creacion).toLocaleDateString('es-ES') : 'N/A'
        };
        setEditedFolder(folderData);
        setOriginalData(JSON.parse(JSON.stringify(folderData))); // Copia profunda para comparar cambios
    };

    const handleInputChange = (field, value) => {
        setEditedFolder({
            ...editedFolder,
            [field]: value
        });
    };

    const handleUpdate = async () => {
        try {
            // Preparar datos para enviar al backend
            const updateData = {
                nombre: editedFolder.name,
                padre_id: editedFolder.parentId || null
            };
            await categoriesService.update(selectedFolder.id, updateData);
            toast.success(`Se ha actualizado la carpeta: ${editedFolder.name}`);
            
            // Sincronizar datos originales con editados
            setOriginalData(JSON.parse(JSON.stringify(editedFolder)));
            
            // Limpiar toast de cambios sin guardar
            if (unsavedChangesToastId) {
                toast.removeToast?.(unsavedChangesToastId);
                setUnsavedChangesToastId(null);
            }
            
            await loadFolders();
        } catch (error) {
            console.error('Error actualizando carpeta:', error);
            toast.error('Error al actualizar: ' + error.message);
        }
    };

    const handleViewContent = () => {
        navigate(`/todos?carpeta=${selectedFolder.id}`);
    };

    const handleAddFolder = () => {
        setIsCreateFolderModalOpen(true);
    };

    const handleCreateFolder = async (folderData) => {
        try {
            await categoriesService.create(folderData);
            toast.success(`Carpeta "${folderData.nombre}" creada correctamente`);
            await loadFolders();
            setIsCreateFolderModalOpen(false);
        } catch (error) {
            console.error('Error creando carpeta:', error);
            toast.error('Error al crear carpeta: ' + error.message);
        }
    };

    const handleDeleteFolder = async (deleteBookmarks = false) => {
        try {
            await categoriesService.delete(selectedFolder.id, deleteBookmarks);
            setIsDeleteModalOpen(false);
            if (deleteBookmarks) {
                toast.success('Carpeta y marcadores eliminados correctamente');
            } else {
                toast.success('Carpeta eliminada. Los marcadores se movieron a la carpeta padre');
            }
            // Navegar a HomePage después de eliminar
            navigate('/');
        } catch (error) {
            console.error('Error eliminando carpeta:', error);
            toast.error('Error al eliminar: ' + error.message);
        }
    };

    const handleToggleTag = async (tagId) => {
        try {
            if (!selectedFolder) return;

            const tagExists = editedFolder.tags?.some(t => t.id === tagId);
            
            if (tagExists) {
                // Remover tag
                await categoriesService.removeTag(selectedFolder.id, tagId);
            } else {
                // Agregar tag
                await categoriesService.addTags(selectedFolder.id, [tagId]);
            }

            // Recargar la carpeta para actualizar los tags
            const updatedCategory = await categoriesService.getById(selectedFolder.id);
            setEditedFolder({
                ...editedFolder,
                tags: updatedCategory.tags || []
            });
            toast.success('Tags actualizados correctamente');
        } catch (error) {
            console.error('Error toggling tag:', error);
            toast.error('Error al cambiar tag: ' + error.message);
        }
    };

    const allFolders = getAllFolders(folders);
    const availableParents = allFolders.filter(f => f.id !== editedFolder?.id);

    if (isLoading) {
        return (
            <div className="manage-page-layout">
                <div className="manage-header">
                    <h2>Gestiona tus carpetas</h2>
                </div>
                <div className="manage-content">
                    <p>Cargando carpetas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="manage-page-layout">
            <div className="manage-header">
                <h2>Gestiona tus carpetas</h2>
            </div>

            <div className="manage-content">
                <ManageSidebarFolder
                    title="Carpetas"
                    items={folders}
                    selectedId={selectedFolder?.id}
                    onSelect={handleSelectFolder}
                    onAdd={handleAddFolder}
                />

                <SearchResultsPanel />

                <ManageFolderCenter
                    folder={editedFolder}
                    onChange={handleInputChange}
                    availableParents={availableParents}
                    availableTags={tags}
                    onToggleTag={handleToggleTag}
                />

                <QuickActionsPanel
                    viewButtonText="Ver contenido"
                    onUpdate={handleUpdate}
                    onView={handleViewContent}
                    onDelete={() => setIsDeleteModalOpen(true)}
                />
            </div>

            <DeleteFolderModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                folderName={selectedFolder?.nombre || selectedFolder?.name}
                onDelete={handleDeleteFolder}
            />

            <CreateFolderModal
                isOpen={isCreateFolderModalOpen}
                onClose={() => setIsCreateFolderModalOpen(false)}
                onCreateFolder={handleCreateFolder}
            />
        </div>
    );
}

export default ManageFoldersContent;