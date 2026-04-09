import React from "react";
import "./FolderItem.css";

function FolderItem({ icono, titulo, contador, subcarpetas }) {
    return (
        <div className={"folder-item"}>
            <img src={icono} alt="Icono de carpeta" className={"folder-item__icon"}/>
            <div className={"folder-item__info"}>
                <span className={"folder-item__title"}>{titulo}</span>
                <span className={"folder-item__count"}>{contador}</span>

                {subcarpetas && subcarpetas.length > 0 && (
                    <div className={"folder-item__subcarpetas"}>
                        {subcarpetas.map((subcarpeta, index) => (
                            <span key={index} className={"folder-item__subcarpeta-title"}>{subcarpeta}</span>
                        )) }
                    </div>
                )}
            </div>
        </div>
    );
}

export default FolderItem;