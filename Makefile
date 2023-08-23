.PHONY: rust-format rust-lint quicktype

build: python svelte rust
	cargo tauri build

quicktype:
	yarn quicktype src-python/sample-calls/canonical -o src-python/zamm/api/models.py
	yarn quicktype src-python/sample-calls/canonical -o src-tauri/src/python_api.rs --visibility public --derive-debug --derive-clone --derive-partial-eq

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
