import React, { useState } from 'react';
import FolderItem from './FolderItem';
import CreateFolderModal from './CreateFolderModal';
import TagBadge from './TagBadge'; // Reutilizamos el TagBadge
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
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <aside className="sidebar-container">


            <div className="sidebar-block">
                <div className="sidebar__header">
                    <h3 className="sidebar__title">Carpetas</h3>
                    <button className="sidebar__add-btn" onClick={() => setIsModalOpen(true)}>
                        <img src={iconoAñadir} alt="Añadir carpeta" className="sidebar__add-icon" />
                    </button>
                </div>

                <div className="sidebar__list">
                    <FolderItem icono={iconoArchivador} titulo="Todos los marcadores" contador="" />
                    <FolderItem icono={iconoCarpeta} titulo="Carpeta 1" contador="" subcarpetas={["Subcarpeta 1", "Subcarpeta 2"]} />
                    <FolderItem icono={iconoCarpeta} titulo="Carpeta 2" contador="" />
                    <FolderItem icono={iconoCarpeta} titulo="Carpeta 3" contador="" />
                </div>
            </div>


            <div className="sidebar-block">
                <div className="sidebar__header">
                    <h3 className="sidebar__title">Tags</h3>
                    <button className="sidebar__add-btn" style={{ fontSize: '18px', padding: '0 8px' }}>+</button>
                </div>
                <div className="sidebar__tags-list">
                    {SIDEBAR_TAGS.map(tag => (
                        <div key={tag.id} style={{ marginBottom: '10px' }}>
                            <TagBadge texto={tag.name} colorHex={tag.color} isSelected={false} />
                        </div>
                    ))}
                </div>
            </div>

            <CreateFolderModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </aside>
    );
}

export default Sidebar;