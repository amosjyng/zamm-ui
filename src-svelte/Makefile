.PHONY: format lint test

build: $(shell find src -type f \( -name "*.svelte" -o -name "*.js" -o -name "*.ts" -o -name "*.html" \) -not -path "*/node_modules/*")
	yarn && yarn svelte-kit sync && yarn build

test:
	yarn test

format:
	yarn prettier --write --plugin prettier-plugin-svelte src/

lint:
	yarn svelte-check --fail-on-warnings
	yarn eslint --fix src/ --ext .js,.ts,.svelte

clean:
	rm -rf build
