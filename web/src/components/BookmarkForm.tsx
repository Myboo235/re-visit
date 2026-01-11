import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { isValidUrl, getFaviconUrl, getPlaceholderThumbnail } from '@/lib/utils';
import type { Bookmark } from '@/types';

interface BookmarkFormProps {
    bookmark?: Bookmark;
    onSubmit: (data: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>) => void;
    onCancel: () => void;
}

export function BookmarkForm({ bookmark, onSubmit, onCancel }: BookmarkFormProps) {
    const [title, setTitle] = useState(bookmark?.title || '');
    const [url, setUrl] = useState(bookmark?.url || '');
    const [description, setDescription] = useState(bookmark?.description || '');
    const [tags, setTags] = useState(bookmark?.tags.join(', ') || '');
    const [error, setError] = useState('');

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
            favicon: getFaviconUrl(url),
            thumbnail: getPlaceholderThumbnail(url),
        };

        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
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
                <Label htmlFor="url">URL *</Label>
                <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
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
