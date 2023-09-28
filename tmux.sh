#!/bin/bash

tmux new-session -d -s zamm 'yarn workspace gui storybook --ci'
tmux split-window -h 'yarn tauri dev'
tmux attach-session -t zamm
