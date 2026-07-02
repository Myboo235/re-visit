import { useState, useEffect } from 'react';
import { BookmarkCard } from './BookmarkCard';
import { Button } from '@/components/ui/button';
import { Inbox, Grid3x3, List, Upload, Loader2, Plus } from 'lucide-react';
import type { Bookmark } from '@/types';
import { useBookmarks } from '@/contexts/BookmarkContext';
import { useInView } from 'react-intersection-observer';

interface BookmarkListProps {
    onEdit: (bookmark: Bookmark) => void;
    onDelete: (id: string) => void;
    onPreview: (bookmark: Bookmark) => void;
    onImport?: () => void;
    onAdd?: () => void;
    selectedBookmarkId?: string;
    isImporting?: boolean;
}

export function BookmarkList({ onEdit, onDelete, onPreview, onImport, onAdd, selectedBookmarkId, isImporting }: BookmarkListProps) {
    const {
        bookmarks,
        filter,
        searchQuery,
        hasNextPage,
        fetchNextPage,
        isFetchingNextPage,
        isLoading
    } = useBookmarks();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const { ref, inView } = useInView();

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    // Apply sidebar filter locally for now if needed, 
    // or better, backend should support it too.
    // For now, let's keep it local for folders/tags since the backend search only does text.
    const filteredBookmarks = bookmarks.filter((bookmark) => {
        // Context/Sidebar Filter
        if (filter.type === 'all') return true;
        if (filter.type === 'unsorted') return !bookmark.folder || bookmark.folder === 'Unsorted';
        if (filter.type === 'folder') return bookmark.folder === filter.value;
        if (filter.type === 'tag') return bookmark.tags.includes(filter.value!);

        return true;
    });

    const getFilterLabel = () => {
        if (filter.type === 'all') return 'All Bookmarks';
        if (filter.type === 'unsorted') return 'Unsorted';
        if (filter.type === 'folder') return `Folder: ${filter.value}`;
        if (filter.type === 'tag') return `Tag: #${filter.value}`;
        return 'Bookmarks';
    };

    if (isLoading && bookmarks.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-background">
            <div className="p-4 border-b border-border/50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                    <h2 className="text-lg font-semibold truncate">{getFilterLabel()}</h2>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {filteredBookmarks.length}
                    </span>
                </div>
            </div>

            <div className="flex-1 relative flex flex-col min-h-0">
                {/* Sub-header for View Mode Toggle */}
                <div className="px-4 py-2 flex justify-end gap-1 bg-muted/5 border-b border-border/10 shrink-0">
                    <Button
                        variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                        size="icon"
                        className="h-7 w-7 rounded-sm"
                        onClick={() => setViewMode('grid')}
                        title="Grid view"
                    >
                        <Grid3x3 className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                        size="icon"
                        className="h-7 w-7 rounded-sm"
                        onClick={() => setViewMode('list')}
                        title="List view"
                    >
                        <List className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {filteredBookmarks.length === 0 && !isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-12">
                            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                <Inbox className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold mb-1">
                                {searchQuery ? 'No bookmarks found' : 'No bookmarks in this view'}
                            </h3>
                            <p className="text-sm text-muted-foreground max-w-sm mb-6">
                                {searchQuery
                                    ? 'Try adjusting your search query'
                                    : 'This category is currently empty'
                                }
                            </p>
                            {!searchQuery && (
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={onImport}
                                        disabled={isImporting}
                                    >
                                        {isImporting ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                            <Upload className="h-4 w-4 mr-2" />
                                        )}
                                        Import HTML
                                    </Button>
                                    <Button size="sm" onClick={onAdd}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Bookmark
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className={viewMode === 'grid'
                                ? 'flex flex-wrap gap-4 justify-start'
                                : 'flex flex-col gap-3 w-full'
                            }>
                                {filteredBookmarks.map((bookmark) => (
                                    <BookmarkCard
                                        key={bookmark.id}
                                        bookmark={bookmark}
                                        onEdit={onEdit}
                                        onDelete={onDelete}
                                        onPreview={onPreview}
                                        isSelected={bookmark.id === selectedBookmarkId}
                                        viewMode={viewMode}
                                    />
                                ))}
                            </div>

                            {/* Infinite scroll loader trigger */}
                            <div ref={ref} className="h-10 flex items-center justify-center mt-4">
                                {isFetchingNextPage && (
                                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
