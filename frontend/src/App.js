import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import BookmarksPage from './pages/BookmarksPage';
import ManageFoldersPage from './pages/ManageFoldersPage';
import './App.css';
import ManageTagsPage from "./pages/ManageTagsPage";
import ManageBookmarksPage from "./pages/ManageBookmarksPage";

function App() {
    return (
        <Router>
            <div className="App">
                <Header />
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/todos" element={<BookmarksPage />} />
                    <Route path="/gestionar-carpetas" element={<ManageFoldersPage />} />
                    <Route path="/gestionar-tags" element={<ManageTagsPage />} />
                    <Route path="/gestionar-marcadores" element={<ManageBookmarksPage />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;