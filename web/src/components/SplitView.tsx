import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PanelRightClose, PanelRight, Loader2, ExternalLink, AlertCircle, Contrast, Bookmark as BookmarkIcon } from 'lucide-react';
import type { Bookmark } from '@/types';
import { isLikelyCSPBlocked } from '@/lib/utils';
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"

interface SplitViewProps {
    children: React.ReactNode;
    previewUrl?: string;
    previewBookmark?: Bookmark;
}

export function SplitView({ children, previewUrl, previewBookmark }: SplitViewProps) {
    const [showPreview, setShowPreview] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [iframeError, setIframeError] = useState(false);
    const [showCSPWarning, setShowCSPWarning] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        if (previewUrl) {
            // Check if URL is likely to be blocked BEFORE trying to load
            const isBlocked = isLikelyCSPBlocked(previewUrl);

            if (isBlocked) {
                // Skip iframe entirely, show custom error page
                setIframeError(true);
                setIsLoading(false);
                setShowCSPWarning(false);
            } else {
                // Try to load the iframe
                setIsLoading(true);
                setIframeError(false);
                setShowCSPWarning(false);
            }
        }
    }, [previewUrl]);

    const handleTogglePreview = () => {
        setShowPreview(!showPreview);
    };

    const handleIframeLoad = () => {
        setIsLoading(false);
        setIframeError(false);
    };

    const handleIframeError = () => {
        setIframeError(true);
        setIsLoading(false);
    };

    const toggleIframeTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    // Note: CSS actual injection into cross-origin iframes is blocked by browsers.
    // We use CSS filters as a fallback to simulate "overriding" themes.
    const iframeStyle = isDarkMode ? {
        filter: 'invert(0.9) hue-rotate(180deg)',
    } : {};

    return (
        <div className="h-full w-full relative">
            <ResizablePanelGroup direction="horizontal" className="h-full w-full">
                {/* Bookmark List Panel */}
                <ResizablePanel defaultSize={70} minSize={20}>
                    <div className="h-full border-r border-border/50 overflow-hidden">
                        {children}
                    </div>
                </ResizablePanel>

                {(showPreview && previewUrl) && (
                    <>
                        <ResizableHandle withHandle />
                        <ResizablePanel defaultSize={30} minSize={30}>
                            {/* Preview Panel */}
                            <div className="h-full flex flex-col bg-muted/20">
                                {/* Preview Header */}
                                <div className="h-14 border-b border-border/50 flex items-center justify-between px-4 bg-background/95 backdrop-blur shrink-0">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        {previewBookmark?.favicon && (
                                            <img
                                                src={previewBookmark.favicon}
                                                alt=""
                                                className="w-4 h-4 flex-shrink-0"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        )}
                                        <span className="text-sm font-medium truncate">
                                            {previewBookmark?.title || 'Preview'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={toggleIframeTheme}
                                            title="Toggle Preview Theme"
                                            className={isDarkMode ? "text-primary bg-primary/10" : ""}
                                        >
                                            <Contrast className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => window.open(previewUrl, '_blank')}
                                            title="Open in new tab"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={handleTogglePreview}
                                            title="Close preview"
                                        >
                                            <PanelRightClose className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Preview Content */}
                                <div className="flex-1 relative bg-background overflow-hidden">
                                    {/* Loading State */}
                                    {isLoading && !iframeError && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm z-10 p-6 text-center">
                                            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                                            <p className="text-sm font-medium">Connecting to {new URL(previewUrl).hostname}...</p>
                                            <p className="text-xs text-muted-foreground mt-1">This may take a moment</p>
                                        </div>
                                    )}

                                    {/* CSP Warning - Toast style */}
                                    {showCSPWarning && !iframeError && !isLoading && (
                                        <div className="absolute top-4 left-4 right-4 z-20 animate-in fade-in slide-in-from-top-2">
                                            <Card className="p-3 bg-yellow-500/10 border-yellow-500/30 backdrop-blur-md">
                                                <div className="flex items-start gap-2">
                                                    <AlertCircle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                                                    <div className="flex-1 text-[11px]">
                                                        <p className="font-semibold text-yellow-500 uppercase tracking-wider">Restricted Preview</p>
                                                        <p className="text-muted-foreground mt-0.5 leading-relaxed">
                                                            This domain often restricts external previews. You might need to open it in a new tab.
                                                        </p>
                                                    </div>
                                                </div>
                                            </Card>
                                        </div>
                                    )}

                                    {/* Error State - Custom Prevent Page */}
                                    {iframeError && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-background z-40 animate-in fade-in duration-500">
                                            <div className="flex flex-col items-center max-w-sm w-full">
                                                {/* App Logo/Brand */}
                                                <div className="mb-8 flex flex-col items-center gap-4">
                                                    <div className="h-16 w-16 rounded-2xl bg-primary/20 flex items-center justify-center shadow-2xl shadow-primary/20 border border-primary/20 rotate-3 hover:rotate-0 transition-transform duration-500">
                                                        <BookmarkIcon className="h-8 w-8 text-primary" />
                                                    </div>
                                                    <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/50 bg-clip-text text-transparent">Re-Visit</h2>
                                                </div>

                                                <div className="space-y-4 text-center mb-10">
                                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/10 border border-destructive/20 text-[10px] font-bold uppercase tracking-[0.2em] text-destructive animate-pulse">
                                                        Connection Refused
                                                    </div>
                                                    <h3 className="text-xl font-semibold">Preview Unavailable</h3>
                                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                                        For security reasons, <strong>{new URL(previewUrl).hostname}</strong> does not allow itself to be embedded. You'll need to open this content directly.
                                                    </p>
                                                </div>

                                                <div className="w-full flex flex-col gap-3">
                                                    <Button
                                                        onClick={() => window.open(previewUrl, '_blank')}
                                                        className="w-full h-12 text-sm font-semibold shadow-lg shadow-primary/20 active:scale-95 transition-all"
                                                    >
                                                        <ExternalLink className="mr-2 h-4 w-4" />
                                                        Open Original Site
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        onClick={handleTogglePreview}
                                                        className="w-full text-muted-foreground hover:text-foreground h-12"
                                                    >
                                                        Return to Bookmarks
                                                    </Button>
                                                </div>

                                                <div className="mt-12 pt-8 border-t border-border/50 w-full text-center">
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium opacity-50">
                                                        Secure Preview Environment
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Iframe */}
                                    {!iframeError && (
                                        <iframe
                                            ref={iframeRef}
                                            src={previewUrl}
                                            className="w-full h-full border-0 transition-all duration-300 bg-white"
                                            style={iframeStyle}
                                            title="Bookmark Preview"
                                            onLoad={handleIframeLoad}
                                            onError={handleIframeError}
                                            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                                        />
                                    )}
                                </div>
                            </div>
                        </ResizablePanel>
                    </>
                )}
            </ResizablePanelGroup>

            {/* Toggle Button (when preview is hidden) */}
            {(!showPreview || !previewUrl) && (
                <div className="absolute top-4 right-4 z-10">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleTogglePreview}
                        title="Show preview"
                        className="shadow-lg bg-background hover:bg-muted"
                    >
                        <PanelRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
