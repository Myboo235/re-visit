import re

from revisit.handlers.bookmark_handler import BookmarkHandler


class IOHandler:
    def __init__(self, bookmark_handler: BookmarkHandler):
        self.bh = bookmark_handler

    def export_to_html(self, output_file: str) -> int:
        bookmarks = self.bh.list_bookmarks()
        if not bookmarks:
            return 0

        with open(output_file, "w", encoding="utf-8") as f:
            f.write("<!DOCTYPE NETSCAPE-Bookmark-file-1>\n")
            f.write('<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">\n')
            f.write("<TITLE>Bookmarks</TITLE>\n")
            f.write("<H1>Bookmarks</H1>\n")
            f.write("<DL><p>\n")

            for b in bookmarks:
                timestamp = int(b.created_at.timestamp())
                tags = ",".join(b.tags)
                f.write(
                    f'    <DT><A HREF="{b.url}" ADD_DATE="{timestamp}" TAGS="{tags}">{b.name}</A>\n'
                )

            f.write("</DL><p>\n")
        return len(bookmarks)

    def import_from_html(self, input_file: str) -> int:
        with open(input_file, "r", encoding="utf-8") as f:
            content = f.read()

        pattern = re.compile(
            r'<A HREF="([^"]+)"(?:[^>]*ADD_DATE="([^"]*)")?'
            r'(?:[^>]*TAGS="([^"]*)")?[^>]*>([^<]*)</A>',
            re.IGNORECASE,
        )
        matches = pattern.findall(content)

        count = 0
        for url, _date, tags_str, name in matches:
            tag_list = [t.strip() for t in tags_str.split(",")] if tags_str else []
            self.bh.add_bookmark(url=url, name=name or url, tags=tag_list)
            count += 1
        return count
