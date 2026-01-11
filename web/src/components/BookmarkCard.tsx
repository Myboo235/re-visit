import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ExternalLink, MoreVertical, Pencil, Trash2, Eye, Image as ImageIcon } from 'lucide-react';
import type { Bookmark } from '@/types';

interface BookmarkCardProps {
    bookmark: Bookmark;
    onEdit: (bookmark: Bookmark) => void;
    onDelete: (id: string) => void;
    onPreview: (bookmark: Bookmark) => void;
    isSelected?: boolean;
    viewMode?: 'list' | 'grid';
}

export function BookmarkCard({ bookmark, onEdit, onDelete, onPreview, isSelected, viewMode }: BookmarkCardProps) {
    const isGrid = viewMode === 'grid';

    return (
        <Card
            className={`group hover:border-primary/50 transition-all duration-200 cursor-pointer overflow-hidden flex ${isGrid ? 'flex-col h-[18vh] w-[18vh] py-0 shrink-0' : 'flex-row h-24 w-full'
                } ${isSelected ? 'border-primary ring-2 ring-primary/20' : ''}`}
            onClick={() => onPreview(bookmark)}
        >
            {/* Thumbnail */}
            {bookmark.thumbnail && (
                <div className={`relative bg-muted overflow-hidden shrink-0 ${isGrid ? 'w-full h-3/5' : 'w-32 h-full border-r'
                    }`}>
                    <img
                        src={bookmark.thumbnail}
                        alt={bookmark.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            )}

            {/* No thumbnail fallback */}
            {!bookmark.thumbnail && (
                <div className={`relative bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shrink-0 ${isGrid ? 'w-full h-3/5' : 'w-32 h-full border-r'
                    }`}>
                    <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                </div>
            )}

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <CardHeader className={`p-3 space-y-0 ${isGrid ? 'pb-1' : 'pb-2'}`}>
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            {bookmark.favicon && (
                                <img
                                    src={bookmark.favicon}
                                    alt=""
                                    className="w-4 h-4 flex-shrink-0"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            )}
                            <CardTitle className={`font-semibold truncate ${isGrid ? 'text-[11px]' : 'text-sm'}`}>
                                {bookmark.title}
                            </CardTitle>
                        </div>

                        {!isGrid && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onPreview(bookmark); }}>
                                        <Eye className="mr-2 h-4 w-4" /> Preview
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.open(bookmark.url, '_blank'); }}>
                                        <ExternalLink className="mr-2 h-4 w-4" /> Open
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(bookmark); }}>
                                        <Pencil className="mr-2 h-4 w-4" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={(e) => { e.stopPropagation(); onDelete(bookmark.id); }}
                                        className="text-destructive"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                    {!isGrid && (
                        <CardDescription className="text-xs truncate text-muted-foreground/70 mt-0.5">
                            {bookmark.url}
                        </CardDescription>
                    )}
                </CardHeader>

                {!isGrid && (bookmark.description || bookmark.tags.length > 0) && (
                    <CardContent className="px-3 pb-3 py-0 min-w-0">
                        {bookmark.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {bookmark.tags.slice(0, 2).map((tag) => (
                                    <Badge key={tag} variant="secondary" className="text-[10px] h-4 py-0 px-1.5 font-normal">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </CardContent>
                )}
            </div>
        </Card>
    );
}
