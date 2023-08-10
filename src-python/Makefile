.PHONY: format lint test tests clean release

all: format lint test

format:
	ruff check --fix .
	black .

lint:
	mypy .
	ruff check .
	black . --check

test: tests
tests:
	pytest -v

clean:
# https://stackoverflow.com/a/41386937/257583
	find . -type f -name '*.py[co]' -delete -o -type d -name __pycache__ -delete
	rm -rf build

sidecar:
	pyinstaller -F zamm/main.py --distpath ../src-tauri/binaries/ --name zamm-python-x86_64-unknown-linux-gnu
