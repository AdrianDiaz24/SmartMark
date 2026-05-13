import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import BookmarksPage from './pages/BookmarksPage';
import ManageFoldersPage from './pages/ManageFoldersPage';
import ManageTagsPage from "./pages/ManageTagsPage";
import ManageBookmarksPage from "./pages/ManageBookmarksPage";
import { ToastProvider } from './context/ToastContext';
import { ToastContainer } from './components/Toast';
import './App.css';

function App() {
    return (
        <ToastProvider>
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
                    <ToastContainer />
                </div>
            </Router>
        </ToastProvider>
    );
}

export default App;