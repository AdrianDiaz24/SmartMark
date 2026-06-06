import React from 'react';
import SidebarTags from '../components/SidebarTags';
import ManageTagsContent from '../components/ManageTagsContent';

function ManageTagsPage() {
    return (
        <main className="app-layout">
            <SidebarTags />
            <ManageTagsContent />
        </main>
    );
}

export default ManageTagsPage;