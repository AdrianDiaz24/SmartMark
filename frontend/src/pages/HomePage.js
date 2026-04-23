import React from 'react';
import Sidebar from '../components/Sidebar';
import MainContent from '../components/MainContent';

function HomePage() {
    return (
        <main className="app-layout">
            <Sidebar />
            <MainContent />
        </main>
    );
}

export default HomePage;