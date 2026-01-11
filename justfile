set shell := ["bash", "-c"]

# Run the revisit CLI
run *args:
	@uv run python -m revisit.cli {{args}}

# Run tests
test:
	@uv run pytest

# Build the package
build:
	@uv build

# Install dependencies
install:
	@uv sync

# Initial setup (sync dependencies + install pre-commit hooks)
setup:
	@uv sync
	@uv run pre-commit install

# Reset the database (caution!)
db-reset:
	rm -f bookmarks.db
	@uv run python -m revisit.cli version

# Serve the web UI
serve:
	@uv run python -m revisit.cli server

# Lint the code using ruff
lint *args:
	@uv run ruff check . {{args}}

# Format the code using ruff
format *args:
	@uv run ruff format . {{args}}
