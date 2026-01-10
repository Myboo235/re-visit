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

# Reset the database (caution!)
db-reset:
	rm -f bookmarks.db
	@uv run python -m revisit.cli version

# Serve the web UI
serve:
	@uv run python -m revisit.cli server
