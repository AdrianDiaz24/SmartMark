import React from "react";
import './Sidebar.css';
import FolderItem from "./FolderItem";


import iconoAñadir from '../assets/Img/añadir_carpeta.png';
import iconoCarpeta from '../assets/Img/carpeta.png';
import iconoArchivador from '../assets/Img/archivador.png';

function Sidebar(){
    return (
        <aside className="sidebar">
            <section className={"sidebar__header"}>
                <h3 className={"sidebar__title"}>Carpetas</h3>
                <button className={"sidebar__add-btn"}>
                    <img src={iconoAñadir} alt="Añadir carpeta" className={"sidebar__add-icon"}/>
                    Añadir carpeta
                </button>
            </section>
            <section className={"sidebar__list"}>
                <FolderItem
                    icono={iconoArchivador}
                    titulo="Todos los marcadores"
                    contador="200 links"
                />
                <FolderItem
                    icono={iconoCarpeta}
                    titulo="Carpeta 1"
                    contador="100 links"
                    subcarpetas={["Subcarpeta 1", "Subcarpeta 2"]}
                />
                <FolderItem
                    icono={iconoCarpeta}
                    titulo="Carpeta 2"
                    contador="50 links"
                />
                <FolderItem
                    icono={iconoCarpeta}
                    titulo="Carpeta 3"
                    contador="50 links"
                />
            </section>
        </aside>
    )
}

export default Sidebar;