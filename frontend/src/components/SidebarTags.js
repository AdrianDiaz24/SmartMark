import React, { useState, useEffect } from 'react';
import { useSidebar } from '../context/SidebarContext';
import CreateTagModal from './CreateTagModal';
import TagBadge from './TagBadge';
import { tagsService } from '../services/tagsService';
import { useToast } from '../hooks/useToast';
import './Sidebar.css';

function SidebarTags() {
    const toast = useToast();
    const { isMenuOpen, closeMenu } = useSidebar();
    const [isTagModalOpen, setIsTagModalOpen] = useState(false);
    const [tags, setTags] = useState([]);
    const [tagsLoading, setTagsLoading] = useState(true);
    const [selectedTagId, setSelectedTagId] = useState(null);

    useEffect(() => {
        loadTags();
    }, []);

    const loadTags = async () => {
        try {
            setTagsLoading(true);
            const data = await tagsService.getAll();
            setTags(data || []);
        } catch (error) {
            console.error('Error cargando tags:', error);
            setTags([]);
        } finally {
            setTagsLoading(false);
        }
    };

    const handleCreateTag = async (tagData) => {
        try {
            await tagsService.create(tagData);
            toast.success(`Tag "${tagData.nombre}" creado correctamente`);
            await loadTags();
            setIsTagModalOpen(false);
        } catch (error) {
            console.error('Error creando tag:', error);
            toast.error('Error al crear tag: ' + error.message);
        }
    };

    const handleTagClick = (tagId) => {
        setSelectedTagId(tagId);
        closeMenu();
    };

    return (
        <>
            <div className={`sidebar-overlay ${isMenuOpen ? 'sidebar-overlay--active' : ''}`} onClick={closeMenu}></div>

            <aside className={`sidebar-container ${isMenuOpen ? 'sidebar-container--open' : ''}`}>
                <div className="sidebar-tags">
                    <div className="sidebar-tags__header">
                        <h3>Tags</h3>
                        <button className="sidebar-tags__add-btn" onClick={() => setIsTagModalOpen(true)}>
                            +
                        </button>
                    </div>
                    <div className="sidebar-tags__list">
                        {tagsLoading ? (
                            <p style={{ fontSize: '12px', color: '#999' }}>Cargando...</p>
                        ) : tags.length > 0 ? (
                            tags.map(tag => (
                                <TagBadge
                                    key={tag.id}
                                    texto={tag.nombre}
                                    colorHex={tag.color}
                                    isSelected={selectedTagId === tag.id}
                                    onClick={() => handleTagClick(tag.id)}
                                />
                            ))
                        ) : (
                            <p style={{ fontSize: '12px', color: '#999' }}>Sin tags</p>
                        )}
                    </div>
                </div>

                <CreateTagModal 
                    isOpen={isTagModalOpen} 
                    onClose={() => setIsTagModalOpen(false)}
                    onCreateTag={handleCreateTag}
                />
            </aside>
        </>
    );
}

export default SidebarTags;



