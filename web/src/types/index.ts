export interface Bookmark {
    id: string;
    title: string;
    url: string;
    description?: string;
    tags: string[];
    folder?: string;
    favicon?: string;
    thumbnail?: string;
    createdAt: string;
    updatedAt: string;
}

export interface User {
    username: string;
}

export interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => boolean;
    logout: () => void;
    isAuthenticated: boolean;
}

export interface BookmarkContextType {
    bookmarks: Bookmark[];
    addBookmark: (bookmark: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateBookmark: (id: string, bookmark: Partial<Bookmark>) => void;
    deleteBookmark: (id: string) => void;
    getBookmark: (id: string) => Bookmark | undefined;
}
