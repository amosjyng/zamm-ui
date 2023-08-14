.PHONY: format lint test tests clean release

target/release/zamm: ./Cargo.toml $(shell find . -type f \( -name "*.rs" \) -not -path "./target/*")
	cargo build --release
	touch target/release/zamm

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
