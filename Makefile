.PHONY: help i dev t c fix build clean docker-test

help:
	@echo "Usage: make <target>"
	@echo ""
	@echo "  i, install    Install dependencies"
	@echo "  dev           Run in development mode"
	@echo "  t, test       Run tests"
	@echo "  c, check      Run all checks (lint + typecheck)"
	@echo "  fix           Auto-fix linting issues"
	@echo "  build         Build for all platforms"
	@echo "  docker-test   Test install script in Docker"

i install:
	bun install

dev:
	bun run dev

t test:
	bun test

c check:
	bun run check

fix:
	bun run lint:fix

build:
	bun run build

clean:
	rm -rf dist node_modules

docker-test:
	docker build -f Dockerfile.test -t worklog-test . && docker run --rm worklog-test
