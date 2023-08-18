#!/usr/bin/bash

clippy_output=$(cargo clippy --manifest-path src-tauri/Cargo.toml --fix --allow-dirty --allow-staged --all-targets --all-features -- -Dwarnings 2>&1 | tee /dev/tty)

if [[ $clippy_output == *"warning"* ]]; then
  exit 1;
fi
