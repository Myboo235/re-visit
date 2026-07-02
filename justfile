set shell := ["bash", "-c"]

# Run the revisit CLI
run *args:
	@uv run python -m revisit.cli {{args}}

# Run tests
test:
	@uv run pytest

# Build the package (including web UI)
build: build-web
	@uv build

# Build the web UI
build-web:
	cd web && pnpm install && pnpm run build

# Install dependencies
install:
	@uv sync

# Initial setup (sync dependencies + install pre-commit hooks)
setup:
	@uv sync
	cd web && pnpm install
	@uv run pre-commit install

# Reset the database (caution!)
db-reset:
	rm -f bookmarks.db
	@uv run python -m revisit.cli version

# Serve the web UI (production build)
serve:
	@uv run python -m revisit.cli server

# Lint the code using ruff
lint *args:
	@uv run ruff check . {{args}}

# Format the code using ruff
format *args:
	@uv run ruff format . {{args}}

# Generate API client from OpenAPI spec (requires server running on port 8080)
gen-api:
	@echo "Fetching OpenAPI spec from server..."
	curl -s http://localhost:8080/openapi/openapi.json -o web/openapi.json
	@echo "Removing invalid securitySchemes..."
	sed -i 's/,"securitySchemes":null//g' web/openapi.json
	@echo "Generating TypeScript client..."
	cd web && pnpm run generate-api
	@echo "Done!"

# Start backend server on port 8080 for development
backend:
	@uv run python -m revisit.cli server --port 8080

# Start frontend dev server
frontend:
	cd web && pnpm run dev

# Run both backend and frontend in development mode (use tmux or two terminals)
dev:
	@echo "Starting backend on port 8080..."
	@uv run python -m revisit.cli server --port 8080 &
	@sleep 2
	@echo "Starting frontend dev server..."
	cd web && pnpm run dev
