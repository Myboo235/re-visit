from bs4 import BeautifulSoup

from revisit.handlers.bookmark_handler import BookmarkHandler, BookmarkParams

_SYSTEM_FOLDERS = frozenset(
    {
        "bookmarks bar",
        "bookmarks menu",
        "other bookmarks",
        "mobile bookmarks",
        "bookmarks toolbar",
        "unfiled bookmarks",
    }
)


class IOHandler:
    def __init__(self, bookmark_handler: BookmarkHandler):
        self.bh = bookmark_handler

    def generate_html(self) -> str:
        bookmarks = self.bh.list_bookmarks()
        if not bookmarks:
            return ""

        lines = [
            "<!DOCTYPE NETSCAPE-Bookmark-file-1>",
            '<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">',
            "<TITLE>Bookmarks</TITLE>",
            "<H1>Bookmarks</H1>",
            "<DL><p>",
        ]

        for b in bookmarks:
            timestamp = int(b.created_at.timestamp())
            tags = ",".join(b.tags)
            lines.append(
                f'    <DT><A HREF="{b.url}" ADD_DATE="{timestamp}" TAGS="{tags}">{b.name}</A>'
            )

        lines.append("</DL><p>")
        return "\n".join(lines)

    def export_to_html(self, output_file: str) -> int:
        content = self.generate_html()
        if not content:
            return 0
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(content)
        return len(self.bh.list_bookmarks())

    # ------------------------------------------------------------------
    # Import helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _find_parent_folder(a_tag) -> str | None:
        """Traverse the DOM upward from an <A> tag to find its folder <H3>."""
        dt = a_tag.parent
        if not dt:
            return None
        dl = dt.parent
        if not (dl and dl.name == "dl"):
            return None

        parent_dt = dl.parent
        if parent_dt and parent_dt.name == "dt":
            h3 = parent_dt.find("h3", recursive=False)
            if h3:
                return h3.get_text().strip()
        else:
            prev = dl.previous_sibling
            while prev:
                if hasattr(prev, "name") and prev.name == "dt":
                    h3 = prev.find("h3", recursive=False)
                    if h3:
                        return h3.get_text().strip()
                    break
                prev = prev.previous_sibling
        return None

    def _import_anchor(self, a, seen_urls: set, generate_folder_tags: bool) -> bool:
        """Process a single <A> tag. Returns True if a bookmark was imported."""
        url = a.get("href", "").strip()
        if not url or url.startswith("javascript:") or url.startswith("place:"):
            return False
        if url in seen_urls:
            return False
        seen_urls.add(url)

        title = a.get_text().strip() or url

        tags_str = a.get("tags") or a.get("labels") or ""
        tags = [t.strip() for t in tags_str.split(",") if t.strip()]

        folder = self._find_parent_folder(a)

        if generate_folder_tags and folder and folder not in tags:
            tags.append(folder)

        if folder and folder.lower() in _SYSTEM_FOLDERS:
            folder = None

        self.bh.add_bookmark(
            url=url,
            name=title,
            params=BookmarkParams(tags=tags, folder=folder),
        )
        return True

    def import_from_string(self, content: str, generate_folder_tags: bool = False) -> int:
        """
        Import bookmarks from HTML string in Netscape Bookmark format.

        Uses an approach inspired by Shiori: find all anchor tags first,
        then traverse up to find the parent folder.

        Args:
            content: HTML string content
            generate_folder_tags: If True, add parent folder name as a tag

        Returns:
            Number of bookmarks imported
        """
        soup = BeautifulSoup(content, "html.parser")
        seen_urls: set[str] = set()
        count = 0

        for a in soup.select("dt > a"):
            try:
                if self._import_anchor(a, seen_urls, generate_folder_tags):
                    count += 1
            except Exception as e:
                print(f"Warning: Failed to import bookmark: {e}")

        if count == 0:
            for a in soup.find_all("a", href=True):
                url = a.get("href", "").strip()
                if not url or url.startswith("javascript:") or url.startswith("place:"):
                    continue
                if url in seen_urls:
                    continue
                seen_urls.add(url)
                title = a.get_text().strip() or url
                self.bh.add_bookmark(
                    url=url,
                    name=title,
                    params=BookmarkParams(tags=[]),
                )
                count += 1

        return count

    def import_from_html(self, input_file: str) -> int:
        with open(input_file, "r", encoding="utf-8") as f:
            content = f.read()
        return self.import_from_string(content)
