from typing import Any, Dict
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup


def fetch_metadata(url: str) -> Dict[str, Any]:
    user_agent = (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/91.0.4472.124 Safari/537.36"
    )
    headers = {"User-Agent": user_agent}

    metadata = {
        "title": "",
        "description": "",
        "favicon": "",
        "thumbnail": "",
        "is_iframe_blocked": False,
        "blocked_reason": "",
    }

    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()

        # Check for Iframe blocking headers
        x_frame_options = response.headers.get("X-Frame-Options", "").upper()
        if "DENY" in x_frame_options or "SAMEORIGIN" in x_frame_options:
            metadata["is_iframe_blocked"] = True
            metadata["blocked_reason"] = f"X-Frame-Options: {x_frame_options}"

        csp = response.headers.get("Content-Security-Policy", "")
        if "frame-ancestors" in csp:
            metadata["is_iframe_blocked"] = True
            metadata["blocked_reason"] = "CSP: frame-ancestors restricted"

        soup = BeautifulSoup(response.text, "html.parser")

        # Title
        title_tag = soup.find("title")
        if title_tag:
            metadata["title"] = title_tag.text.strip()

        # OG Title
        og_title = soup.find("meta", property="og:title")
        if og_title:
            metadata["title"] = og_title.get("content", metadata["title"])

        # Description
        desc_tag = soup.find("meta", attrs={"name": "description"})
        if desc_tag:
            metadata["description"] = desc_tag.get("content", "").strip()

        og_desc = soup.find("meta", property="og:description")
        if og_desc:
            metadata["description"] = og_desc.get("content", metadata["description"]).strip()

        # Favicon
        icon_link = soup.find("link", rel=lambda x: x and "icon" in x.lower())
        if icon_link:
            metadata["favicon"] = urljoin(url, icon_link.get("href", ""))
        else:
            # Fallback to standard favicon.ico
            parsed_url = urlparse(url)
            metadata["favicon"] = f"{parsed_url.scheme}://{parsed_url.netloc}/favicon.ico"

        # OG Image (Thumbnail)
        og_image = soup.find("meta", property="og:image")
        if og_image:
            metadata["thumbnail"] = urljoin(url, og_image.get("content", ""))

    except Exception as e:
        metadata["blocked_reason"] = f"Error fetching: {e!s}"

    return metadata
