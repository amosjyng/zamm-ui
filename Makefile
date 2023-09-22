.PHONY: rust-format rust-lint quicktype

BUILD_IMAGE = ghcr.io/amosjyng/zamm:v0.0.0-build
CURRENT_DIR = $(shell pwd)

build: python svelte rust
	cargo tauri build

copy-docker-deps:
	mv /tmp/dependencies/src-svelte/forks/neodrag/packages/svelte/dist ./src-svelte/forks/neodrag/packages/svelte/dist
	mv /tmp/dependencies/node_modules ./node_modules
	mv /tmp/dependencies/src-svelte/node_modules ./src-svelte/node_modules
	mv /tmp/dependencies/target ./src-tauri/target

build-docker:
	docker run --rm -v $(CURRENT_DIR):/zamm -w /zamm $(BUILD_IMAGE) make copy-docker-deps build

icon:
	yarn tauri icon src-tauri/icons/icon.png

docker:
	docker build . -t $(BUILD_IMAGE)
	docker push $(BUILD_IMAGE)

test: python svelte rust
	cd src-python && make test
	cd src-svelte && make test
	cd src-tauri && make test
	yarn e2e-test

quicktype:
	yarn quicktype src-python/api/schemas/* -s schema -o src-python/zamm/api/models.py
	yarn quicktype src-python/api/schemas/* -s schema -o src-tauri/src/python_api.rs --visibility public --derive-debug --derive-clone --derive-partial-eq
	yarn quicktype src-python/api/sample-calls/schema.json -s schema -o src-python/tests/api/sample_call.py
	yarn quicktype src-python/api/sample-calls/schema.json -s schema -o src-tauri/src/sample_call.rs --visibility public --derive-debug
	yarn quicktype src-python/api/sample-calls/schema.json -s schema -o src-svelte/src/lib/sample-call.ts

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

clean:
	cd src-python && make clean
	cd src-svelte && make clean
	cd src-tauri && make clean
