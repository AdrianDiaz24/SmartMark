import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ManageSidebarTag from './ManageSidebarTag';
import ManageTagCenter from './ManageTagCenter';
import QuickActionsPanel from './QuickActionsPanel';
import DeleteTagModal from './DeleteTagModal';
import './ManageFoldersContent.css'; // Reutilizamos el layout general que ya teníamos perfecto!

const MOCK_TAGS_DATA = [
    { id: '1', name: 'tag 1', color: '51986C', foldersTagged: 0, bookmarksTagged: 10, date: '26/03/2026' },
    { id: '2', name: 'tag 2', color: 'FF4343', foldersTagged: 2, bookmarksTagged: 25, date: '15/01/2026' },
    { id: '3', name: 'tag 3: lorem ipsum', color: '616060', foldersTagged: 1, bookmarksTagged: 8, date: '10/02/2026' }
];

function ManageTagsContent() {
    const [selectedTag, setSelectedTag] = useState(MOCK_TAGS_DATA[2]); // Empezamos con el tag 3 como en tu foto
    const [editedTag, setEditedTag] = useState(MOCK_TAGS_DATA[2]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const navigate = useNavigate();

    const handleSelectTag = (tag) => {
        setSelectedTag(tag);
        setEditedTag(tag);
    };

    const handleInputChange = (field, value) => {
        setEditedTag({ ...editedTag, [field]: value });
    };

    const handleUpdate = () => {
        alert(`Tag actualizado:\nNombre: ${editedTag.name}\nColor: ${editedTag.color}`);
    };

    const handleViewContent = () => {
        navigate(`/todos?tag=${selectedTag.name}`);
    };

    return (
        <div className="manage-page-layout">
            <div className="manage-header">
                <h2>Gestiona tus tags</h2>
            </div>

            <div className="manage-content">
                <ManageSidebarTag
                    title="Tags"
                    items={MOCK_TAGS_DATA}
                    selectedId={selectedTag.id}
                    onSelect={handleSelectTag}
                    onAdd={() => console.log('Añadir tag')}
                />

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
            </div>

            <DeleteTagModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                tagName={selectedTag.name}
            />
        </div>
    );
}

export default ManageTagsContent;