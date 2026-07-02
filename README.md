# Re-Visit

Re-Visit is a modern, self-hosted bookmark manager with a powerful CLI and a premium web interface. Inspired by [Shiori](https://github.com/go-shiori/shiori), it offers an enhanced experience with automatic metadata fetching and a sleek split-view preview.

## Features

- **Automated Metadata**: Fetches titles, descriptions, favicons, and thumbnails automatically.
- **Smart Previews**: Detects iframe-blocking sites and provides direct links with a custom error page.
- **Modern Web UI**: Built with React and Tailwind CSS, featuring a beautiful dark-mode interface and glassmorphism design.
- **CLI Mastery**: Full control over your bookmarks via a fast Python command-line tool.
- **User Authentication**: Simple and secure login management.
- **Import/Export**: Compatible with Netscape Bookmark files (HTML).

## Quick Start

### Installation
```bash
# Clone the repository
git clone https://github.com/myboo/re-visit
cd re-visit

# Install dependencies and build frontend
just setup
just build
```

### Running the Server
```bash
revisit server
```
Default credentials: **admin / admin**

## 🛠️ Tech Stack

- **Backend**: Python 3.12, Flask, SQLite, Pydantic, BeautifulSoup4.
- **Frontend**: React 18, Vite, TanStack Query, Lucide Icons, Tailwind CSS.
- **Dev Tools**: `uv` for Python management, `pnpm` for JavaScript, `just` for task automation.

## 📖 Documentation

Detailed guides can be found in the [docs](./docs/guide.md) directory.
Check out [llms.txt](./docs/llms.txt) for a project overview designed for AI assistants.