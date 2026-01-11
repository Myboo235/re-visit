import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Bookmark } from '@/types';
import { getPlaceholderThumbnail } from '@/lib/utils';

export interface Filter {
    type: 'all' | 'folder' | 'tag' | 'unsorted';
    value?: string;
}

export interface BookmarkContextType {
    bookmarks: Bookmark[];
    addBookmark: (bookmark: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateBookmark: (id: string, bookmark: Partial<Bookmark>) => void;
    deleteBookmark: (id: string) => void;
    getBookmark: (id: string) => Bookmark | undefined;
    filter: Filter;
    setFilter: (filter: Filter) => void;
    folders: string[];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export function BookmarkProvider({ children }: { children: React.ReactNode }) {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [filter, setFilter] = useState<Filter>({ type: 'all' });
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        // Load bookmarks from localStorage
        const storedBookmarks = localStorage.getItem('bookmarks');
        if (storedBookmarks) {
            setBookmarks(JSON.parse(storedBookmarks));
        } else {
            // Add some sample bookmarks for demo
            const sampleBookmarks: Bookmark[] = [
                {
                    id: '1',
                    title: 'React Documentation',
                    url: 'https://react.dev',
                    description: 'The official React documentation',
                    tags: ['react', 'documentation', 'frontend'],
                    folder: 'Development',
                    favicon: 'https://react.dev/favicon.ico',
                    thumbnail: getPlaceholderThumbnail('https://react.dev'),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
                {
                    id: '2',
                    title: 'Tailwind CSS',
                    url: 'https://tailwindcss.com',
                    description: 'A utility-first CSS framework',
                    tags: ['css', 'tailwind', 'styling'],
                    folder: 'Design',
                    favicon: 'https://tailwindcss.com/favicons/favicon-32x32.png',
                    thumbnail: getPlaceholderThumbnail('https://tailwindcss.com'),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
            ];
            setBookmarks(sampleBookmarks);
            localStorage.setItem('bookmarks', JSON.stringify(sampleBookmarks));
        }
    }, []);

    const folders = Array.from(new Set(bookmarks.map(b => b.folder).filter((f): f is string => !!f)));

    const saveBookmarks = (newBookmarks: Bookmark[]) => {
        setBookmarks(newBookmarks);
        localStorage.setItem('bookmarks', JSON.stringify(newBookmarks));
    };

    const addBookmark = (bookmark: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>) => {
        const newBookmark: Bookmark = {
            ...bookmark,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        saveBookmarks([...bookmarks, newBookmark]);
    };

    const updateBookmark = (id: string, updates: Partial<Bookmark>) => {
        const updatedBookmarks = bookmarks.map((bookmark) =>
            bookmark.id === id
                ? { ...bookmark, ...updates, updatedAt: new Date().toISOString() }
                : bookmark
        );
        saveBookmarks(updatedBookmarks);
    };

    const deleteBookmark = (id: string) => {
        const filteredBookmarks = bookmarks.filter((bookmark) => bookmark.id !== id);
        saveBookmarks(filteredBookmarks);
    };

    const getBookmark = (id: string) => {
        return bookmarks.find((bookmark) => bookmark.id === id);
    };

    return (
        <BookmarkContext.Provider
            value={{
                bookmarks,
                addBookmark,
                updateBookmark,
                deleteBookmark,
                getBookmark,
                filter,
                setFilter,
                folders,
                searchQuery,
                setSearchQuery
            }}
        >
            {children}
        </BookmarkContext.Provider>
    );
}

export function useBookmarks() {
    const context = useContext(BookmarkContext);
    if (context === undefined) {
        throw new Error('useBookmarks must be used within a BookmarkProvider');
    }
    return context;
}
