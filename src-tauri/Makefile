.PHONY: format lint test tests clean release

all: format lint test build

format:
	cargo fmt

lint:
	cargo clippy -- -Dwarnings

build:
	cargo build --release

test: tests
tests:
	cargo test

clean:
	cargo clean
