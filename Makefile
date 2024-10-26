# Makefile for javascript_htmx_geo_widget_frontend
# https://www.gnu.org/software/make/manual/make.html
SHELL := /usr/bin/env bash

APP = "$$(pwd)"
BUN_VERSION = 1.1.33
HTMX_VERSION = 2.0.3
ALPINEJS_VERSION = 3.14.3

install: ## Install the application requirements
	## Install a specific release of bun: $(BUN_VERSION)
	## See Also: https://bun.sh/docs/installation
	[ -n "$$(which bun)" ] || curl -fsSL https://bun.sh/install | bash -s "bun-v$(BUN_VERSION)"
	@echo "BUN = $$(which bun)"

	## Make sure BUN_INSTALL is defined
	[ -n "$$BUN_INSTALL" ] || export BUN_INSTALL="$$HOME/.bun"
	@echo "BUN_INSTALL = $$BUN_INSTALL"

	## Make sure BUN_INSTALL is in PATH
	[ -n "$$(echo $$PATH | tr ':' '\n' | grep $$BUN_INSTALL)" ] || export $$PATH=$$PATH:$$BUN_INSTALL
	@echo "BUN_INSTALL is in PATH = $$(echo $$PATH | tr ':' '\n' | grep $$BUN_INSTALL)"

	## Install the application requirements using bun
	bun install

update: ## Update the application dependencies
	## Upgrade to the latest release of bun
	## See Also: https://bun.sh/docs/installation#upgrading
	[ "$$(bun --version)" == "$(BUN_VERSION)" ] || bun upgrade
	@echo "bun --version: $$(bun --version)"

	## Update outdated dependencies
	bun update

	## Download a specific release of htmx: $(HTMX_VERSION)
	## See Also: 
	##   - https://htmx.org/docs/#installing
	##   - https://github.com/bigskysoftware/htmx/releases
	mkdir -p public/js # Make sure the target directory exists
	[ -a "public/js/htmx.min-v$(HTMX_VERSION).js" ] || curl -L https://unpkg.com/htmx.org@$(HTMX_VERSION) -o public/js/htmx.min-v$(HTMX_VERSION).js
	ln -svf htmx.min-v$(HTMX_VERSION).js public/js/htmx.min.js
	ls -l public/js/htmx*
	@echo "htmx.min.js integrity: sha384-$$(cat public/js/htmx.min.js | openssl dgst -sha384 -binary | openssl base64 -A)"
	
	## Download a specific release of alpinejs: $(ALPINEJS_VERSION)
	## See Also: 
	##   - https://alpinejs.dev/essentials/installation
	##   - https://github.com/alpinejs/alpine/releases
	mkdir -p public/js # Make sure the target directory exists
	[ -a "public/js/alpinejs.v$(ALPINEJS_VERSION).min.js" ] || curl -L https://cdn.jsdelivr.net/npm/alpinejs@$(ALPINEJS_VERSION)/dist/cdn.min.js -o public/js/alpinejs.v$(ALPINEJS_VERSION).min.js
	ln -svf alpinejs.v$(ALPINEJS_VERSION).min.js public/js/alpinejs.min.js
	ls -l public/js/alpinejs*
	@echo "alpinejs.min.js integrity: sha384-$$(cat public/js/alpinejs.min.js | openssl dgst -sha384 -binary | openssl base64 -A)"

format: ## Format the application source code
	## Format the application source code using
	## See Also: https://prettier.io
	bun format

lint: ## Lint the application source code
	## Lint the application source code using 
	## See Also: https://eslint.org
	bun lint

test: ## Test the appliaction
	## Test the appliaction using ????
	## See Also: https://hono.dev/docs/getting-started/bun#testing
	bun test
	## Test the appliaction using ????
	## See Also: https://playwright.dev/docs/intro
	bunx --bun playwright test

depcheck: ## Dependency check for known vulnarbilities
	@echo "Not implemented yet!"

secscan: ## Run a source code security analyzer
	@echo "Not implemented yet!"

all: install lint test depcheck secscan

# Actions that don't require target files

.PHONY: help
help: ## Print a list of make options available
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' ${MAKEFILE_LIST} | sort | \
	awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

.PHONY: clean
clean: ## Clean up files used locally when needed
	@echo "Not implemented yet!"