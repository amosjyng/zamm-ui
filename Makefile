.PHONY: rust-format rust-lint

build: python-build svelte-build rust-build
	cargo tauri build

python-build:
	cd src-python && poetry run make

rust-format:
	cd src-tauri && make format

rust-lint:
	cd src-tauri && make lint

rust-build:
	cd src-tauri && make build

svelte: svelte-format svelte-lint

svelte-format:
	yarn prettier --write --plugin prettier-plugin-svelte src/

svelte-lint:
	yarn svelte-check --fail-on-warnings
	yarn eslint --fix src/

svelte-build:
	yarn && yarn build
