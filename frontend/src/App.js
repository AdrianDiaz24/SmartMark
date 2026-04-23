import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';


import './App.css';

function App() {
    return (
        <Router>
            <div className="App">
                <Header />
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    {/* <Route path="/todos" element={<BookmarksPage />} /> */}
                </Routes>
            </div>
        </Router>
    );
}

export default App;