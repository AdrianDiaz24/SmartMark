import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import BookmarksPage from './pages/BookmarksPage';
import ManageFoldersPage from './pages/ManageFoldersPage';
import ManageTagsPage from "./pages/ManageTagsPage";
import ManageBookmarksPage from "./pages/ManageBookmarksPage";
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PrivateRoute from './components/PrivateRoute';
import { ToastProvider } from './context/ToastContext';
import { SearchProvider } from './context/SearchContext';
import { AuthProvider } from './context/AuthContext';
import { SidebarProvider } from './context/SidebarContext';
import { ToastContainer } from './components/Toast';
import './App.css';

function App() {
    return (
        <ToastProvider>
            <AuthProvider>
                <SearchProvider>
                    <SidebarProvider>
                        <Router>
                            <div className="App">
                                <Routes>
                                    {/* Rutas públicas (login y registro) */}
                                    <Route path="/login" element={<LoginPage />} />
                                    <Route path="/registro" element={<RegisterPage />} />

                                    {/* Rutas protegidas */}
                                    <Route
                                        path="/*"
                                        element={
                                            <PrivateRoute>
                                                <>
                                                    <Header />
                                                    <Routes>
                                                        <Route path="/" element={<HomePage />} />
                                                        <Route path="/todos" element={<BookmarksPage />} />
                                                        <Route path="/gestionar-carpetas" element={<ManageFoldersPage />} />
                                                        <Route path="/gestionar-tags" element={<ManageTagsPage />} />
                                                        <Route path="/gestionar-marcadores" element={<ManageBookmarksPage />} />
                                                        <Route path="*" element={<Navigate to="/" />} />
                                                    </Routes>
                                                </>
                                            </PrivateRoute>
                                        }
                                    />
                                </Routes>
                                <ToastContainer />
                            </div>
                        </Router>
                    </SidebarProvider>
                </SearchProvider>
            </AuthProvider>
        </ToastProvider>
    );
}

export default App;