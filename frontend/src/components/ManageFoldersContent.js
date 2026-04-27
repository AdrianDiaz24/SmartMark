import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ManageSidebarFolder from './ManageSidebarFolder';
import ManageFolderCenter from './ManageFolderCenter';
import QuickActionsPanel from './QuickActionsPanel';
import DeleteFolderModal from './DeleteFolderModal';
import './ManageFoldersContent.css';

const MOCK_FOLDERS_DATA = [
    {
        id: '2', name: 'Carpeta 1', parent: 'General', subfolders: 2, bookmarks: 45, date: '12/01/2026',
        children: [
            { id: '1a', name: 'Subcarpeta 1', parent: 'Carpeta 1', subfolders: 0, bookmarks: 10, date: '26/03/2026' },
            { id: '1b', name: 'Subcarpeta 2', parent: 'Carpeta 1', subfolders: 0, bookmarks: 5, date: '27/03/2026' }
        ]
    },
    { id: '3', name: 'Carpeta 2', parent: 'General', subfolders: 0, bookmarks: 5, date: '05/02/2026' },
    { id: '4', name: 'Carpeta 3', parent: 'General', subfolders: 0, bookmarks: 2, date: '06/02/2026' }
];

const getFlatFolders = (folders) => {
    let result = [];
    folders.forEach(folder => {
        result.push(folder);
        if (folder.children) {
            result = result.concat(getFlatFolders(folder.children));
        }
    });
    return result;
};

function ManageFoldersContent() {
    const [selectedFolder, setSelectedFolder] = useState(MOCK_FOLDERS_DATA[0].children[0]);
    const [editedFolder, setEditedFolder] = useState(MOCK_FOLDERS_DATA[0].children[0]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const navigate = useNavigate();

    const handleSelectFolder = (folder) => {
        setSelectedFolder(folder);
        setEditedFolder(folder);
    };

    const handleInputChange = (field, value) => {
        setEditedFolder({
            ...editedFolder,
            [field]: value
        });
    };

    const handleUpdate = () => {
        console.log("Guardando los nuevos datos de la carpeta:", editedFolder);
        alert(`Se ha actualizado la carpeta a:\nNombre: ${editedFolder.name}\nPadre: ${editedFolder.parent}`);
    };

    const handleViewContent = () => {
        navigate(`/todos?carpeta=${selectedFolder.name}`);
    };

    const handleAddFolder = () => {
        console.log("Abrir modal de crear carpeta");
    };

    const allFolders = getFlatFolders(MOCK_FOLDERS_DATA);
    const availableParents = allFolders.filter(f => f.id !== editedFolder.id);

    return (
        <div className="manage-page-layout">
            <div className="manage-header">
                <h2>Gestiona tus carpetas</h2>
            </div>

            <div className="manage-content">
                <ManageSidebarFolder
                    title="Carpetas"
                    items={MOCK_FOLDERS_DATA}
                    selectedId={selectedFolder.id}
                    onSelect={handleSelectFolder}
                    onAdd={handleAddFolder}
                />

                <ManageFolderCenter
                    folder={editedFolder}
                    onChange={handleInputChange}
                    availableParents={availableParents}
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
                folderName={selectedFolder.name}
            />
        </div>
    );
}

export default ManageFoldersContent;