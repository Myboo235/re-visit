import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBookmarks } from '@/contexts/BookmarkContext';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BookmarkList } from '@/components/BookmarkList';
import { BookmarkForm } from '@/components/BookmarkForm';
import { SplitView } from '@/components/SplitView';
import { Sidebar } from '@/components/Sidebar';
import { Plus, Bookmark, LogOut, User, Search } from 'lucide-react';
import type { Bookmark as BookmarkType } from '@/types';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";

export function Bookmarks() {
    const { user, logout } = useAuth();
    const { bookmarks, addBookmark, updateBookmark, deleteBookmark, searchQuery, setSearchQuery } = useBookmarks();
    const navigate = useNavigate();

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedBookmark, setSelectedBookmark] = useState<BookmarkType | null>(null);
    const [previewBookmark, setPreviewBookmark] = useState<BookmarkType | null>(null);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleAddBookmark = (data: Omit<BookmarkType, 'id' | 'createdAt' | 'updatedAt'>) => {
        addBookmark(data);
        setIsAddDialogOpen(false);
        toast.success('Bookmark added successfully');
    };

    const handleEditBookmark = (data: Omit<BookmarkType, 'id' | 'createdAt' | 'updatedAt'>) => {
        if (selectedBookmark) {
            updateBookmark(selectedBookmark.id, data);
            setIsEditDialogOpen(false);
            setSelectedBookmark(null);
            toast.success('Bookmark updated successfully');
        }
    };

    const handleDeleteBookmark = () => {
        if (selectedBookmark) {
            deleteBookmark(selectedBookmark.id);
            setIsDeleteDialogOpen(false);
            if (previewBookmark?.id === selectedBookmark.id) {
                setPreviewBookmark(null);
            }
            setSelectedBookmark(null);
            toast.success('Bookmark deleted successfully');
        }
    };

    const handlePreview = (bookmark: BookmarkType) => {
        setPreviewBookmark(bookmark);
    };

    return (
        <div className="h-screen flex flex-col bg-background text-foreground">
            {/* Header */}
            <header className="h-14 border-b border-border/50 flex items-center justify-between px-6 bg-background/95 backdrop-blur shrink-0">
                <div className="flex items-center gap-3 w-1/4">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Bookmark className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold">Re-Visit</h1>
                    </div>
                </div>

                <div className="flex-1 flex justify-center max-w-xl">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search anywhere..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-9 bg-muted/40 border-none focus-visible:ring-1 focus-visible:ring-primary/20"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2 w-1/4">
                    <Button onClick={() => setIsAddDialogOpen(true)} size="sm" className="h-9">
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <User className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <div className="px-2 py-1.5 text-sm font-medium">
                                {user?.username}
                            </div>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout}>
                                <LogOut className="mr-2 h-4 w-4" />
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden">
                <ResizablePanelGroup direction="horizontal">
                    <ResizablePanel defaultSize={15} minSize={10} maxSize={25}>
                        <Sidebar />
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={85}>
                        <SplitView
                            previewUrl={previewBookmark?.url}
                            previewBookmark={previewBookmark ?? undefined}
                        >
                            <BookmarkList
                                onEdit={(bookmark) => {
                                    setSelectedBookmark(bookmark);
                                    setIsEditDialogOpen(true);
                                }}
                                onDelete={(id) => {
                                    const bookmark = bookmarks.find(b => b.id === id);
                                    if (bookmark) {
                                        setSelectedBookmark(bookmark);
                                        setIsDeleteDialogOpen(true);
                                    }
                                }}
                                onPreview={handlePreview}
                                selectedBookmarkId={previewBookmark?.id}
                            />
                        </SplitView>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </main>

            {/* Add Bookmark Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Add New Bookmark</DialogTitle>
                        <DialogDescription>
                            Save a new bookmark to your collection
                        </DialogDescription>
                    </DialogHeader>
                    <BookmarkForm
                        onSubmit={handleAddBookmark}
                        onCancel={() => setIsAddDialogOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* Edit Bookmark Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Bookmark</DialogTitle>
                        <DialogDescription>
                            Update your bookmark details
                        </DialogDescription>
                    </DialogHeader>
                    {selectedBookmark && (
                        <BookmarkForm
                            bookmark={selectedBookmark}
                            onSubmit={handleEditBookmark}
                            onCancel={() => {
                                setIsEditDialogOpen(false);
                                setSelectedBookmark(null);
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Delete Bookmark</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{selectedBookmark?.title}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsDeleteDialogOpen(false);
                                setSelectedBookmark(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteBookmark}>
                            Delete
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
