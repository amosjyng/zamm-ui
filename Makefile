.PHONY: rust-format rust-lint

build: python svelte rust
	cargo tauri build

python:
	cd src-python && poetry run make

rust-format:
	cd src-tauri && make format

rust-lint:
	cd src-tauri && make lint

rust:
	cd src-tauri && make

svelte-format:
	cd src-svelte && make format

svelte-lint:
	cd src-svelte && make lint

svelte:
	cd src-svelte && make
