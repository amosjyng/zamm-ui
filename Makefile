.PHONY: rust-format rust-lint

all: rust-format rust-lint

rust-format:
	cd src-tauri && make format

rust-lint:
	cd src-tauri && make lint

svelte: svelte-format svelte-lint

svelte-format:
	yarn prettier --write --plugin prettier-plugin-svelte src/

svelte-lint:
	yarn svelte-check --fail-on-warnings
	yarn eslint --fix src/
