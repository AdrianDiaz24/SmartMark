import React, { useState } from 'react';
import ManageBookmark from './ManageBookmark';
import QuickActionsPanel from './QuickActionsPanel';
import DeleteBookmarkModal from './DeleteBookmarkModal';
import './ManageBookmarksContent.css';

const MOCK_FOLDERS = ['Carpeta 1', 'Carpeta 2', 'Carpeta 3', 'Subcarpeta 1', 'Subcarpeta 2'];

const MOCK_ALL_SYSTEM_TAGS = [
    { id: 1, name: 'tag 1', color: '51986C' },
    { id: 2, name: 'tag 2', color: 'FF4343' },
    { id: 3, name: 'tag 3: lorem ipsum', color: '616060' }
];

const MOCK_BOOKMARK = {
    id: '1',
    url: 'www.example.com',
    name: 'Sitio de ejemplo',
    description: 'Sitio de ejemplo para la prueba de como se veria y tal',
    folder: 'General',
    tags: [
        { id: 1, name: 'tag 1', color: '51986C' }
    ]
};

function ManageBookmarksContent() {
    const [editedBookmark, setEditedBookmark] = useState(MOCK_BOOKMARK);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const handleInputChange = (field, value) => {
        setEditedBookmark({ ...editedBookmark, [field]: value });
    };

    const handleToggleTag = (tagId) => {
        const currentTags = editedBookmark.tags || [];
        const isAlreadySelected = currentTags.some(t => t.id === tagId);

        let newTags;
        if (isAlreadySelected) {
            newTags = currentTags.filter(t => t.id !== tagId);
        } else {
            const tagToAdd = MOCK_ALL_SYSTEM_TAGS.find(t => t.id === tagId);
            if (tagToAdd) {
                newTags = [...currentTags, tagToAdd];
            } else {
                newTags = currentTags;
            }
        }

        setEditedBookmark({ ...editedBookmark, tags: newTags });
    };

    const handleUpdate = () => {
        console.log("Guardando marcador:", editedBookmark);
        alert(`Marcador actualizado con éxito.`);
    };

    const handleVisitWebpage = () => {
        let finalUrl = editedBookmark.url;
        if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
            finalUrl = 'https://' + finalUrl;
        }
        window.open(finalUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="manage-page-layout">
            <div className="manage-header">
                <h2>Gestiona tu marcador</h2>
            </div>

            <div className="manage-content manage-content--2-cols">
                <ManageBookmark
                    bookmark={editedBookmark}
                    onChange={handleInputChange}
                    availableFolders={MOCK_FOLDERS}
                    systemTags={MOCK_ALL_SYSTEM_TAGS}
                    onToggleTag={handleToggleTag}
                />

                <QuickActionsPanel
                    viewButtonText="Visitar pagina web"
                    onUpdate={handleUpdate}
                    onView={handleVisitWebpage}
                    onDelete={() => setIsDeleteModalOpen(true)}
                />
            </div>

            <DeleteBookmarkModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                bookmarkName={editedBookmark.name}
            />
        </div>
    );
}

export default ManageBookmarksContent;