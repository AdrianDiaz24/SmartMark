import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import FolderItem from './FolderItem';
import CreateFolderModal from './CreateFolderModal';
import CreateTagModal from './CreateTagModal';
import TagBadge from './TagBadge';
import './Sidebar.css';

import iconoAñadir from '../assets/Img/añadir_carpeta.png';
import iconoCarpeta from '../assets/Img/carpeta.png';
import iconoArchivador from '../assets/Img/archivador.png';

const SIDEBAR_TAGS = [
    { id: 1, name: 'tag 1', color: '51986C' },
    { id: 2, name: 'tag 2', color: 'FF4343' },
    { id: 3, name: 'tag 3: lorem ipsum', color: '616060' }
];

function Sidebar() {

    const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
    const [isTagModalOpen, setIsTagModalOpen] = useState(false);


    const navigate = useNavigate();
    const [searchParams] = useSearchParams();


    const activeFolder = searchParams.get('carpeta');
    const activeTag = searchParams.get('tag');


    const handleFilter = (tipo, valor) => {
        navigate(`/todos?${tipo}=${valor}`);
    };

    return (
        <aside className="sidebar-container">

            {}
            <div className="sidebar-block">
                <div className="sidebar__header">
                    <h3 className="sidebar__title">Carpetas</h3>
                    <button className="sidebar__add-btn" onClick={() => setIsFolderModalOpen(true)}>
                        <img src={iconoAñadir} alt="Añadir carpeta" className="sidebar__add-icon" />
                    </button>
                </div>

                <div className="sidebar__list">
                    {}
                    <div onClick={() => handleFilter('carpeta', 'todas')} style={{ opacity: activeFolder === 'todas' ? 1 : 0.6, cursor: 'pointer' }}>
                        <FolderItem icono={iconoArchivador} titulo="Todos los marcadores" contador="" />
                    </div>
                    <div onClick={() => handleFilter('carpeta', 'carpeta1')} style={{ opacity: activeFolder === 'carpeta1' ? 1 : 0.6, cursor: 'pointer' }}>
                        <FolderItem icono={iconoCarpeta} titulo="Carpeta 1" contador="" subcarpetas={["Subcarpeta 1", "Subcarpeta 2"]} />
                    </div>
                    <div onClick={() => handleFilter('carpeta', 'carpeta2')} style={{ opacity: activeFolder === 'carpeta2' ? 1 : 0.6, cursor: 'pointer' }}>
                        <FolderItem icono={iconoCarpeta} titulo="Carpeta 2" contador="" />
                    </div>
                    <div onClick={() => handleFilter('carpeta', 'carpeta3')} style={{ opacity: activeFolder === 'carpeta3' ? 1 : 0.6, cursor: 'pointer' }}>
                        <FolderItem icono={iconoCarpeta} titulo="Carpeta 3" contador="" />
                    </div>
                </div>
            </div>

            {}
            <div className="sidebar-block">
                <div className="sidebar__header">
                    <h3 className="sidebar__title">Tags</h3>
                    {/* Conectamos el botón para abrir el nuevo modal de tags */}
                    <button className="sidebar__add-btn" onClick={() => setIsTagModalOpen(true)} style={{ fontSize: '18px', padding: '0 8px' }}>
                        +
                    </button>
                </div>
                {}
                <div className="sidebar__tags-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {SIDEBAR_TAGS.map(tag => (
                        <TagBadge
                            key={tag.id}
                            texto={tag.name}
                            colorHex={tag.color}
                            isSelected={activeTag === tag.name}
                            onClick={() => handleFilter('tag', tag.name)}
                        />
                    ))}
                </div>
            </div>

            {}
            <CreateFolderModal isOpen={isFolderModalOpen} onClose={() => setIsFolderModalOpen(false)} />
            <CreateTagModal isOpen={isTagModalOpen} onClose={() => setIsTagModalOpen(false)} />

        </aside>
    );
}

export default Sidebar;