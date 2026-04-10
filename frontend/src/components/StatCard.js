import React from 'react';
import './StatCard.css';

function StatCard({ titulo, contador }) {
    return (
        <div className="stat-card">
            <div className="stat-card__info">
                <span className="stat-card__title">{titulo}</span>
                <span className="stat-card__count">{contador}</span>
            </div>
        </div>
    );
}

export default StatCard;