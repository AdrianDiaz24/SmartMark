import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import FilterBar from '../components/FilterBar';
import GridCard from '../components/GridCard';
import LinkCard from '../components/LinkCard';
import './BookmarksPage.css';

const MOCK_BOOKMARKS = [
    { id: 1, title: "Lorem ipsum", description: "Lorem ipsum dolor sit amet consectetur adipiscing elit...", tags: [{ id: 1, name: "tag 1", color: "51986C" }, { id: 3, name: "tag 3", color: "616060" }] },
    { id: 2, title: "Lorem ipsum", description: "Lorem ipsum dolor sit amet consectetur adipiscing elit...", tags: [{ id: 1, name: "tag 1", color: "51986C" }, { id: 3, name: "tag 3", color: "616060" }] },
    { id: 3, title: "Lorem ipsum", description: "Lorem ipsum dolor sit amet consectetur adipiscing elit...", tags: [{ id: 1, name: "tag 1", color: "51986C" }, { id: 3, name: "tag 3", color: "616060" }] },
    { id: 4, title: "Lorem ipsum", description: "Lorem ipsum dolor sit amet consectetur adipiscing elit...", tags: [{ id: 1, name: "tag 1", color: "51986C" }, { id: 3, name: "tag 3", color: "616060" }] },
];

function BookmarksPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const activeFolder = searchParams.get('carpeta');
    const activeTag = searchParams.get('tag');
    const [viewMode, setViewMode] = useState('grid');

    const clearFolderFilter = () => {
        if (activeTag) navigate(`/todos?tag=${activeTag}`);
        else navigate('/todos');
    };

    const clearTagFilter = () => {
        if (activeFolder) navigate(`/todos?carpeta=${activeFolder}`);
        else navigate('/todos');
    };

    return (
        <div className="bookmarks-page-wrapper">

            <FilterBar
                activeFolder={activeFolder}
                activeTag={activeTag}
                clearFolderFilter={clearFolderFilter}
                clearTagFilter={clearTagFilter}
                viewMode={viewMode}
                setViewMode={setViewMode}
            />

            <main className="app-layout">
                <Sidebar />

                <section className={`cards-container ${viewMode === 'grid' ? 'cards-container--grid' : 'cards-container--list'}`}>
                    {MOCK_BOOKMARKS.map((bookmark) => (
                        viewMode === 'grid' ? (
                            <GridCard key={bookmark.id} bookmark={bookmark} />
                        ) : (
                            <LinkCard key={bookmark.id} bookmark={bookmark} />
                        )
                    ))}
                </section>
            </main>

        </div>
    );
}

export default BookmarksPage;