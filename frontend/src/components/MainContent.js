import React from 'react';
import StatCard from './StatCard';
import LinkCard from './LinkCard'; // <-- Importamos la nueva tarjeta
import './MainContent.css';

function MainContent() {
    return (
        <section className="main-content">

            <div className="main-content__stats-board">
                <StatCard titulo="Marcadores totales" contador="270 links" />
                <StatCard titulo="Carpetas totales" contador="4" />
                <StatCard titulo="Tags totales" contador="21" />
                <StatCard titulo="Marcadores visitados la ultima semana" contador="50" />
            </div>


            <div className="main-content__recent">
                <div className="main-content__recent-header">
                    <h2 className="main-content__recent-title">Recientes</h2>
                    <button className="main-content__ver-todo-btn">Ver todo</button>
                </div>

                <div className="main-content__recent-list">
                    <LinkCard
                        titulo="Lorem ipsum"
                        descripcion="Lorem ipsum dolor sit amet consectetur adipiscing elit, ultrices inceptos venenatis facilisi gravida ligula interdum,"
                        tags={["Tag 1", "Tag 2"]}
                    />
                    <LinkCard
                        titulo="Lorem ipsum"
                        descripcion="Lorem ipsum dolor sit amet consectetur adipiscing elit, ultrices inceptos venenatis facilisi gravida ligula interdum,"
                        tags={["Tag 1", "Tag 2"]}
                    />
                    <LinkCard
                        titulo="Lorem ipsum"
                        descripcion="Lorem ipsum dolor sit amet consectetur adipiscing elit, ultrices inceptos venenatis facilisi gravida ligula interdum,"
                        tags={["Tag 1", "Tag 2"]}
                    />
                </div>
            </div>

        </section>
    );
}

export default MainContent;