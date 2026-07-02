import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Download, Upload, Loader2 } from 'lucide-react';
import { useImportBookmarksApiBookmarksImportPost } from '@/api/generated/bookmark/bookmark';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface SettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
    const [importing, setImporting] = useState(false);
    const queryClient = useQueryClient();
    const importMutation = useImportBookmarksApiBookmarksImportPost();

    const handleExport = () => {
        window.location.href = '/api/bookmarks/export';
        toast.success('Starting export...');
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImporting(true);
        try {
            const result = await importMutation.mutateAsync({
                data: { file: file as any }
            });

            if (result.status === 200) {
                toast.success(result.data.message);
                queryClient.invalidateQueries({ queryKey: ['/api/bookmarks'] });
            } else {
                toast.error('Import failed');
            }
        } catch (error) {
            console.error('Import error:', error);
            toast.error('An error occurred during import');
        } finally {
            setImporting(false);
            // Reset file input
            e.target.value = '';
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                    <DialogDescription>
                        Manage your bookmarks and application preferences.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="space-y-4">
                        <Label className="text-base">Data Management</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                variant="outline"
                                className="flex flex-col items-center justify-center h-24 gap-2 border-dashed"
                                onClick={handleExport}
                            >
                                <Download className="h-6 w-6" />
                                <span className="text-xs">Export HTML</span>
                            </Button>

                            <div className="relative">
                                <input
                                    type="file"
                                    id="import-file"
                                    className="hidden"
                                    accept=".html"
                                    onChange={handleImport}
                                    disabled={importing}
                                />
                                <Button
                                    variant="outline"
                                    className="w-full flex flex-col items-center justify-center h-24 gap-2 border-dashed"
                                    disabled={importing}
                                    asChild
                                >
                                    <label htmlFor="import-file" className="cursor-pointer">
                                        {importing ? (
                                            <Loader2 className="h-6 w-6 animate-spin" />
                                        ) : (
                                            <Upload className="h-6 w-6" />
                                        )}
                                        <span className="text-xs">Import HTML</span>
                                    </label>
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label className="text-base">About</Label>
                        <div className="rounded-lg bg-muted p-4 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Version</span>
                                <span className="font-mono">0.1.0</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Framework</span>
                                <span className="font-medium">Flask & React</span>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
