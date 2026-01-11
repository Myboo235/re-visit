from typing import Tuple

import requests

from revisit.handlers.bookmark_handler import BookmarkHandler


class CheckHandler:
    def __init__(self, bookmark_handler: BookmarkHandler):
        self.bh = bookmark_handler

    def check_all(self, yield_results=False):
        bookmarks = self.bh.list_bookmarks()
        results = []

        for b in bookmarks:
            status = self.check_link(b.url)
            result = (b, status)
            if yield_results:
                yield result
            else:
                results.append(result)

        if not yield_results:
            return results

    def check_link(self, url: str) -> Tuple[bool, str]:
        status_method_not_allowed = 405
        status_bad_request = 400
        user_agent = (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/91.0.4472.124 Safari/537.36"
        )
        headers = {"User-Agent": user_agent}
        try:
            response = requests.head(url, timeout=10, headers=headers, allow_redirects=True)
            if response.status_code == status_method_not_allowed:
                response = requests.get(url, timeout=10, headers=headers, stream=True)
                response.close()

            if response.status_code < status_bad_request:
                return True, "OK"
            else:
                return False, f"Status {response.status_code}"
        except Exception as e:
            return False, f"Failed: {type(e).__name__}"
