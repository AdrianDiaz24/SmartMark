import React from 'react';
import {useNavigate} from "react-router-dom";
import StatCard from './StatCard';
import LinkCard from './LinkCard'; // <-- Importamos la nueva tarjeta
import './MainContent.css';

function MainContent() {
    const navigate = useNavigate();

    return (
        <section className="main-content">

            <div className="main-content__stats-board">
                <StatCard titulo="Marcadores totales" contador="270 links" />
                <StatCard titulo="Carpetas totales" contador="4" />
                <StatCard titulo="Tags totales" contador="21" />
                <StatCard titulo="Marcadores visitados la ultima semana" contador="50" />
            </div>


            <section className="main-content__recent" aria-labelledby="recent-title">
                <div className="main-content__recent-header">
                    <h2 id="recent-title" className="main-content__recent-title">Recientes</h2>

                    {/* 3. Conectamos el botón para que navegue a la nueva ruta */}
                    <button
                        className="main-content__ver-todo-btn"
                        onClick={() => navigate('/todos')}
                    >
                        Ver todo
                    </button>
                </div>

                <div className="main-content__recent-list">
                    <LinkCard
                        titulo="Lorem ipsum"
                        descripcion="Lorem ipsum dolor sit amet consectetur adipiscing elit, ultrices inceptos venenatis facilisi gravida ligula interdum,"
                        tags={[
                            { id: 1, name: "Tag 1", color: "51986C" },
                            { id: 2, name: "Tag 2", color: "FF4343" }
                        ]}
                    />
                    <LinkCard
                        titulo="Lorem ipsum"
                        descripcion="Lorem ipsum dolor sit amet consectetur adipiscing elit, ultrices inceptos venenatis facilisi gravida ligula interdum,"
                        tags={[
                            { id: 1, name: "Tag 1", color: "51986C" },
                            { id: 2, name: "Tag 2", color: "FF4343" }
                        ]}
                    />
                    <LinkCard
                        titulo="Lorem ipsum"
                        descripcion="Lorem ipsum dolor sit amet consectetur adipiscing elit, ultrices inceptos venenatis facilisi gravida ligula interdum,"
                        tags={[
                            { id: 1, name: "Tag 1", color: "51986C" },
                            { id: 2, name: "Tag 2", color: "FF4343" }
                        ]}
                    />
                </div>
            </section>

        </section>
    );
}

export default MainContent;