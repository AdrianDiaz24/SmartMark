import React, { createContext, useState, useCallback } from 'react';

export const SearchContext = createContext();

export function SearchProvider({ children }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const updateSearchTerm = useCallback((term) => {
        setSearchTerm(term);
        setIsSearching(term.trim().length > 0);
    }, []);

    const clearSearch = useCallback(() => {
        setSearchTerm('');
        setSearchResults([]);
        setIsSearching(false);
    }, []);

    return (
        <SearchContext.Provider value={{
            searchTerm,
            searchResults,
            isSearching,
            updateSearchTerm,
            setSearchResults,
            clearSearch
        }}>
            {children}
        </SearchContext.Provider>
    );
}

export function useSearch() {
    const context = React.useContext(SearchContext);
    if (!context) {
        throw new Error('useSearch debe usarse dentro de SearchProvider');
    }
    return context;
}

