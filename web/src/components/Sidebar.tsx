import { useBookmarks } from '@/contexts/BookmarkContext';
import {
    Inbox,
    Folder,
    Hash,
    Settings,
    Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export function Sidebar() {
    const { bookmarks, filter, setFilter, folders } = useBookmarks();

    const allTags = Array.from(new Set(bookmarks.flatMap(b => b.tags))).sort();

    const getCount = (type: string, value?: string) => {
        if (type === 'all') return bookmarks.length;
        if (type === 'unsorted') return bookmarks.filter(b => !b.folder).length;
        if (type === 'folder') return bookmarks.filter(b => b.folder === value).length;
        if (type === 'tag') return bookmarks.filter(b => b.tags.includes(value!)).length;
        return 0;
    };

    const NavItem = ({
        icon: Icon,
        label,
        count,
        active,
        onClick
    }: {
        icon: any,
        label: string,
        count: number,
        active: boolean,
        onClick: () => void
    }) => (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${active
                ? 'bg-secondary text-secondary-foreground font-medium'
                : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                }`}
        >
            <div className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                <span>{label}</span>
            </div>
            <span className="text-xs opacity-60">{count}</span>
        </button>
    );

    return (
        <div className="flex flex-col h-full bg-background border-r">
            <div className="p-4 flex items-center justify-end">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <Settings className="h-4 w-4" />
                </Button>
            </div>

            <ScrollArea className="flex-1 px-3">
                <div className="space-y-4 py-2">
                    {/* Main Categories */}
                    <div className="space-y-1">
                        <NavItem
                            icon={Inbox}
                            label="All Bookmarks"
                            count={getCount('all')}
                            active={filter.type === 'all'}
                            onClick={() => setFilter({ type: 'all' })}
                        />
                        <NavItem
                            icon={Inbox}
                            label="Unsorted"
                            count={getCount('unsorted')}
                            active={filter.type === 'unsorted'}
                            onClick={() => setFilter({ type: 'unsorted' })}
                        />
                        {/* You could add Images/Links filtering logic here if needed */}
                    </div>

                    {/* Collections / Folders */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-6">
                            <span>{folders.length} Collections</span>
                            <Button variant="ghost" size="icon" className="h-4 w-4">
                                <Plus className="h-3 w-3" />
                            </Button>
                        </div>
                        <div className="space-y-1">
                            {folders.map(folder => (
                                <NavItem
                                    key={folder}
                                    icon={Folder}
                                    label={folder}
                                    count={getCount('folder', folder)}
                                    active={filter.type === 'folder' && filter.value === folder}
                                    onClick={() => setFilter({ type: 'folder', value: folder })}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-6">
                            <span>{allTags.length} Tags</span>
                            <Button variant="ghost" size="icon" className="h-4 w-4">
                                <Plus className="h-3 w-3" />
                            </Button>
                        </div>
                        <div className="space-y-1">
                            {allTags.map(tag => (
                                <NavItem
                                    key={tag}
                                    icon={Hash}
                                    label={tag}
                                    count={getCount('tag', tag)}
                                    active={filter.type === 'tag' && filter.value === tag}
                                    onClick={() => setFilter({ type: 'tag', value: tag })}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}
