import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import TagBadge from './TagBadge';
import TagPopover from './TagPopover';
import { tagsService } from '../services/tagsService';
import { categoriesService } from '../services/categoriesService';
import { useToast } from '../hooks/useToast';
import './CreateFolderModal.css';

function CreateFolderModal({ isOpen, onClose, onCreateFolder }) {
    const toast = useToast();
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [selectedTagIds, setSelectedTagIds] = useState([]);
    const [tags, setTags] = useState([]);
    const [folders, setFolders] = useState([]);
    const [folderName, setFolderName] = useState('');
    const [parentFolderId, setParentFolderId] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Cargar tags y carpetas cuando se abre el modal
    useEffect(() => {
        if (isOpen) {
            loadTags();
            loadFolders();
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
        } catch (error) {
            console.error('Error cargando tags:', error);
            setTags([]);
        }
    };

    const loadFolders = async () => {
        try {
            const data = await categoriesService.getAll();
            setFolders(data || []);
        } catch (error) {
            console.error('Error cargando carpetas:', error);
            setFolders([]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!folderName.trim()) {
            alert('El nombre de la carpeta es requerido');
            return;
        }

        const folderData = {
            nombre: folderName.trim(),
            padre_id: parentFolderId || null,
            tags: selectedTagIds  // Incluir tags
        };

        if (onCreateFolder) {
            onCreateFolder(folderData);
            setFolderName('');
            setParentFolderId('');
            setSelectedTagIds([]);
        } else {
            console.log("Creando carpeta:", folderData);
            onClose();
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

    const flattenFolders = (foldersList) => {
        let result = [];
        foldersList.forEach(folder => {
            result.push(folder);
            if (folder.children && folder.children.length > 0) {
                result = result.concat(flattenFolders(folder.children));
            }
        });
        return result;
    };

    if (!isOpen) return null;

    const modalContent = (
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
                            value={folderName}
                            onChange={(e) => setFolderName(e.target.value)}
                        />
                    </div>

                    <div className="modal__field">
                        <label htmlFor="parent-folder">Carpeta padre</label>
                        <select 
                            id="parent-folder" 
                            className="modal__select"
                            value={parentFolderId}
                            onChange={(e) => setParentFolderId(e.target.value)}
                        >
                            <option value="">-- Sin carpeta padre (raíz) --</option>
                            {folders.length > 0 && flattenFolders(folders).map(folder => (
                                <option key={folder.id} value={folder.id}>
                                    {folder.nombre}
                                </option>
                            ))}
                        </select>
                        <span className="modal__help-text">Por defecto la carpeta padre sera la general</span>
                    </div>

                    <div className="modal__field modal__field--inline">
                        <label>Tags:</label>

                        <div className="modal__selected-tags">
                            {selectedTagIds.map(id => {
                                const tagData = tags.find(t => t.id === id);
                                return tagData ? (
                                    <TagBadge
                                        key={tagData.id}
                                        texto={tagData.nombre}
                                        colorHex={tagData.color}
                                        isSelected={false}
                                    />
                                ) : null;
                            })}
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
                            availableTags={tags.map(t => ({ id: t.id, name: t.nombre, color: t.color }))}
                            selectedTags={selectedTagIds}
                            onToggleTag={handleToggleTag}
                        />
                    </div>

                    <div className="modal__actions">
                        <button type="submit" className="modal__submit-btn" disabled={isLoading}>
                            {isLoading ? 'Creando...' : 'Crear'}
                        </button>
                    </div>

                </form>
            </section>
        </div>
    );

    return ReactDOM.createPortal(modalContent, document.body);
}


export default CreateFolderModal;