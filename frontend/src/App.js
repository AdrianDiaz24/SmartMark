import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import BookmarksPage from './pages/BookmarksPage';
import ManageFoldersPage from './pages/ManageFoldersPage'; // 1. Importamos la nueva página
import './App.css';
import ManageTagsPage from "./pages/ManageTagsPage";

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
                </Routes>
            </div>
        </Router>
    );
}

export default App;