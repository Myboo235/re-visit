import { useState } from 'react';
import type { MetadataOut } from '@/api/generated/model';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { isValidUrl, getFaviconUrl, getPlaceholderThumbnail } from '@/lib/utils';
import type { Bookmark } from '@/types';
import { useGetMetadataApiMetadataPost } from '@/api/generated/utility/utility';
import { Loader2, Sparkles } from 'lucide-react';
import { useBookmarks } from '@/contexts/BookmarkContext';

interface BookmarkFormProps {
    bookmark?: Bookmark;
    onSubmit: (data: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>) => void;
    onCancel: () => void;
}

export function BookmarkForm({ bookmark, onSubmit, onCancel }: BookmarkFormProps) {
    const { folders } = useBookmarks();
    const [title, setTitle] = useState(bookmark?.title || '');
    const [url, setUrl] = useState(bookmark?.url || '');
    const [description, setDescription] = useState(bookmark?.description || '');
    const [tags, setTags] = useState(bookmark?.tags?.join(', ') || '');
    const [folder, setFolder] = useState(bookmark?.folder || '');
    const [error, setError] = useState('');
    const [favicon, setFavicon] = useState(bookmark?.favicon || '');
    const [thumbnail, setThumbnail] = useState(bookmark?.thumbnail || '');
    const [showsPreview, setShowsPreview] = useState(bookmark?.showsPreview ?? true);

    const metadataMutation = useGetMetadataApiMetadataPost();

    const fetchMetadata = async (targetUrl: string, forceOverwrite = false) => {
        if (!isValidUrl(targetUrl)) return;

        metadataMutation.mutate({ data: { url: targetUrl } }, {
            onSuccess: (resp) => {
                if (resp.status === 200) {
                    const data = resp.data as MetadataOut;
                    if (forceOverwrite || !title || title === 'unnamed' || title === '') setTitle(data.title);
                    if (forceOverwrite || !description) setDescription(data.description);
                    if (data.favicon) setFavicon(data.favicon);
                    if (data.thumbnail) setThumbnail(data.thumbnail);
                    setShowsPreview(!data.is_iframe_blocked);
                }
            }
        });
    };

    const handleUrlBlur = () => {
        if (url && (!title || title === 'unnamed' || title === '') && isValidUrl(url)) {
            fetchMetadata(url);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!isValidUrl(url)) {
            setError('Please enter a valid URL');
            return;
        }

        const formData = {
            title: title.trim(),
            url: url.trim(),
            description: description.trim(),
            tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
            folder: folder.trim() || undefined,
            favicon: favicon || getFaviconUrl(url),
            thumbnail: thumbnail || getPlaceholderThumbnail(url),
            showsPreview: showsPreview,
        };

        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="url">URL *</Label>
                <div className="flex gap-2">
                    <Input
                        id="url"
                        type="url"
                        placeholder="https://example.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onBlur={handleUrlBlur}
                        required
                        className="flex-1"
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => fetchMetadata(url, true)}
                        disabled={metadataMutation.isPending || !isValidUrl(url)}
                        title="Fetch metadata"
                    >
                        {metadataMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Sparkles className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                    id="title"
                    type="text"
                    placeholder="My Awesome Bookmark"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                    id="description"
                    type="text"
                    placeholder="A brief description of this bookmark"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="folder">Folder</Label>
                <Input
                    id="folder"
                    type="text"
                    placeholder="Work, Personal, Inspiration..."
                    value={folder}
                    onChange={(e) => setFolder(e.target.value)}
                    list="folder-list"
                />
                <datalist id="folder-list">
                    {folders.map(f => (
                        <option key={f} value={f} />
                    ))}
                </datalist>
            </div>

            <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                    id="tags"
                    type="text"
                    placeholder="react, javascript, tutorial"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Separate tags with commas</p>
            </div>

            {error && (
                <p className="text-sm text-destructive animate-in fade-in-50 duration-200">
                    {error}
                </p>
            )}

            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit">
                    {bookmark ? 'Update' : 'Add'} Bookmark
                </Button>
            </div>
        </form>
    );
}
