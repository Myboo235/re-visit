import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Folder, Hash, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
    renameFolderApiFoldersRenamePost,
    deleteFolderApiFoldersDeletePost,
} from '@/api/generated/folder/folder';
import {
    renameTagApiTagsRenamePost,
    deleteTagApiTagsDeletePost,
} from '@/api/generated/tag/tag';

interface FolderTagItemProps {
    type: 'folder' | 'tag';
    name: string;
    count: number;
    active: boolean;
    onClick: () => void;
}

export function FolderTagItem({ type, name, count, active, onClick }: FolderTagItemProps) {
    const queryClient = useQueryClient();
    const [renameOpen, setRenameOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [newName, setNewName] = useState(name);

    const Icon = type === 'folder' ? Folder : Hash;

    const renameMutation = useMutation({
        mutationFn: async (newName: string) => {
            if (type === 'folder') {
                return renameFolderApiFoldersRenamePost({ old_name: name, new_name: newName });
            } else {
                return renameTagApiTagsRenamePost({ old_name: name, new_name: newName });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/bookmarks'] });
            queryClient.invalidateQueries({ queryKey: ['/api/bookmarks/stats'] });
            toast.success(`${type === 'folder' ? 'Folder' : 'Tag'} renamed successfully`);
            setRenameOpen(false);
        },
        onError: () => {
            toast.error(`Failed to rename ${type}`);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async () => {
            if (type === 'folder') {
                return deleteFolderApiFoldersDeletePost({ name });
            } else {
                return deleteTagApiTagsDeletePost({ name });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/bookmarks'] });
            queryClient.invalidateQueries({ queryKey: ['/api/bookmarks/stats'] });
            toast.success(`${type === 'folder' ? 'Folder' : 'Tag'} deleted successfully`);
            setDeleteOpen(false);
        },
        onError: () => {
            toast.error(`Failed to delete ${type}`);
        },
    });

    const handleRename = () => {
        if (newName.trim() && newName !== name) {
            renameMutation.mutate(newName.trim());
        } else {
            setRenameOpen(false);
        }
    };

    return (
        <>
            <ContextMenu>
                <ContextMenuTrigger asChild>
                    <button
                        onClick={onClick}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${active
                                ? 'bg-secondary text-secondary-foreground font-medium'
                                : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <Icon className="h-4 w-4" />
                            <span>{name}</span>
                        </div>
                        <span className="text-xs opacity-60">{count}</span>
                    </button>
                </ContextMenuTrigger>
                <ContextMenuContent>
                    <ContextMenuItem onClick={() => { setNewName(name); setRenameOpen(true); }}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Rename
                    </ContextMenuItem>
                    <ContextMenuItem
                        onClick={() => setDeleteOpen(true)}
                        className="text-destructive"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>

            {/* Rename Dialog */}
            <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rename {type === 'folder' ? 'Folder' : 'Tag'}</DialogTitle>
                        <DialogDescription>
                            Enter a new name for "{name}". This will update all bookmarks.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="newName">New Name</Label>
                            <Input
                                id="newName"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                                autoFocus
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRenameOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleRename}
                            disabled={renameMutation.isPending || !newName.trim()}
                        >
                            {renameMutation.isPending ? 'Renaming...' : 'Rename'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete {type === 'folder' ? 'Folder' : 'Tag'}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {type === 'folder'
                                ? `This will move all bookmarks in "${name}" to Unsorted. The bookmarks themselves will not be deleted.`
                                : `This will remove the tag "${name}" from all bookmarks. The bookmarks themselves will not be deleted.`
                            }
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteMutation.mutate()}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
