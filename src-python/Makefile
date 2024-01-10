.PHONY: dependencies format lint test tests clean release build

dist/main: $(shell find zamm -type f \( -name "*.py" \))
	poetry install
	poetry run pyinstaller -F zamm/main.py
	cp dist/main ../src-tauri/binaries/zamm-python-x86_64-unknown-linux-gnu

dependencies:
	poetry install

all: format lint test

format:
	ruff check --fix .
	black .

lint:
	mypy .
	ruff check .
	black . --check

test: tests
tests: export ZAMM_DUMMY_API_KEYS = true
tests:
	poetry run pytest -v

clean:
# https://stackoverflow.com/a/41386937/257583
	find . -type f -name '*.py[co]' -delete -o -type d -name __pycache__ -delete
	rm -rf build dist
