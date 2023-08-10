.PHONY: format lint test tests clean release

all: format lint test

format:
	cargo fmt

lint:
	cargo clippy -- -Dwarnings

test: tests
tests:
	cargo test

clean:
	cargo clean
