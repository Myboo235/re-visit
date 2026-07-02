import { createContext, useContext, useState, useMemo } from 'react';
import type { Bookmark } from '@/types';
import type { BookmarkOut } from '@/api/generated/model';
import {
    getBookmarksApiBookmarksGet,
    useAddBookmarkApiBookmarksPost,
    useUpdateBookmarkApiApiBookmarksIntBookmarkIdPut,
    useDeleteBookmarkApiApiBookmarksIntBookmarkIdDelete,
    useGetStatsApiBookmarksStatsGet
} from '@/api/generated/bookmark/bookmark';
import { useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';

export interface BookmarkStats {
    total: number;
    folders: Record<string, number>;
    tags: Record<string, number>;
}

export interface Filter {
    type: 'all' | 'folder' | 'tag' | 'unsorted';
    value?: string;
}

export interface BookmarkContextType {
    bookmarks: Bookmark[];
    isLoading: boolean;
    isFetchingNextPage: boolean;
    hasNextPage: boolean;
    fetchNextPage: () => void;
    addBookmark: (bookmark: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateBookmark: (id: string, bookmark: Partial<Bookmark>) => void;
    deleteBookmark: (id: string) => void;
    getBookmark: (id: string) => Bookmark | undefined;
    filter: Filter;
    setFilter: (filter: Filter) => void;
    folders: string[];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    stats?: BookmarkStats;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export function BookmarkProvider({ children }: { children: React.ReactNode }) {
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState<Filter>({ type: 'all' });
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 300);

    const { data: statsData } = useGetStatsApiBookmarksStatsGet();
    const stats = statsData?.status === 200 ? statsData.data : undefined;

    const {
        data,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ['/api/bookmarks', debouncedSearch],
        queryFn: ({ pageParam = 1 }) =>
            getBookmarksApiBookmarksGet({
                page: pageParam,
                page_size: 20,
                search: debouncedSearch || undefined
            }),
        getNextPageParam: (lastPage) => {
            if (lastPage.status !== 200) return undefined;
            const pagination = lastPage.data;
            return pagination.page < pagination.pages ? pagination.page + 1 : undefined;
        },
        initialPageParam: 1,
    });

    const bookmarks: Bookmark[] = useMemo(() => {
        if (!data?.pages) return [];
        return data.pages.flatMap(page => {
            if (page.status !== 200) return [];
            return page.data.items.map((b: BookmarkOut) => ({
                id: b.id,
                title: b.title,
                url: b.url,
                tags: b.tags ?? [],
                description: b.description ?? '',
                favicon: b.favicon ?? '',
                thumbnail: b.thumbnail ?? '',
                showsPreview: b.shows_preview ?? true,
                createdAt: b.createdAt,
                updatedAt: b.updatedAt,
                folder: b.folder || 'Unsorted',
            }));
        });
    }, [data]);

    const addMutation = useAddBookmarkApiBookmarksPost({
        mutation: {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: [`/api/bookmarks`] });
                queryClient.invalidateQueries({ queryKey: [`/api/bookmarks/stats`] });
                toast.success('Bookmark added');
            },
            onError: (err) => {
                toast.error('Failed to add bookmark');
                console.error('Add bookmark error:', err);
            }
        }
    });

    const updateMutation = useUpdateBookmarkApiApiBookmarksIntBookmarkIdPut({
        mutation: {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: [`/api/bookmarks`] });
                queryClient.invalidateQueries({ queryKey: [`/api/bookmarks/stats`] });
                toast.success('Bookmark updated');
            },
            onError: (err) => {
                toast.error('Failed to update bookmark');
                console.error('Update bookmark error:', err);
            }
        }
    });

    const deleteMutation = useDeleteBookmarkApiApiBookmarksIntBookmarkIdDelete({
        mutation: {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: [`/api/bookmarks`] });
                queryClient.invalidateQueries({ queryKey: [`/api/bookmarks/stats`] });
                toast.success('Bookmark deleted');
            },
            onError: (err) => {
                toast.error('Failed to delete bookmark');
                console.error('Delete bookmark error:', err);
            }
        }
    });

    const folders = useMemo(() => {
        if (stats?.folders) {
            return Object.keys(stats.folders).sort();
        }
        return Array.from(new Set(bookmarks.map(b => b.folder).filter((f): f is string => !!f))).sort();
    }, [stats, bookmarks]);

    const addBookmark = (bookmark: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>) => {
        addMutation.mutate({
            data: {
                url: bookmark.url,
                title: bookmark.title,
                tags: bookmark.tags,
                folder: bookmark.folder,
                description: bookmark.description,
                favicon: bookmark.favicon,
                thumbnail: bookmark.thumbnail,
                shows_preview: bookmark.showsPreview
            }
        });
    };

    const updateBookmark = (id: string, updates: Partial<Bookmark>) => {
        updateMutation.mutate({
            bookmarkId: parseInt(id),
            data: {
                url: updates.url,
                title: updates.title,
                tags: updates.tags,
                folder: updates.folder,
                description: updates.description,
                favicon: updates.favicon,
                thumbnail: updates.thumbnail,
                shows_preview: updates.showsPreview
            }
        });
    };

    const deleteBookmark = (id: string) => {
        deleteMutation.mutate({
            bookmarkId: parseInt(id)
        });
    };

    const getBookmark = (id: string) => {
        return bookmarks.find((bookmark) => bookmark.id === id);
    };

    return (
        <BookmarkContext.Provider
            value={{
                bookmarks,
                isLoading,
                isFetchingNextPage,
                hasNextPage,
                fetchNextPage,
                addBookmark,
                updateBookmark,
                deleteBookmark,
                getBookmark,
                filter,
                setFilter,
                folders,
                searchQuery,
                setSearchQuery,
                stats
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
