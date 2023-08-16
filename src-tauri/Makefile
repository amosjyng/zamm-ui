.PHONY: format lint test tests clean release

build:
	cargo build --release

all: format lint test build

format:
	cargo fmt

lint:
	cargo clippy -- -Dwarnings

test: tests
tests:
	cargo test

clean:
	cargo clean
