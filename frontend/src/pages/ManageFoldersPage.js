import React from 'react';
import SidebarFolders from '../components/SidebarFolders';
import ManageFoldersContent from '../components/ManageFoldersContent';

function ManageFoldersPage() {
    return (
        <main className="app-layout">
            <SidebarFolders />
            <ManageFoldersContent />
        </main>
    );
}

export default ManageFoldersPage;