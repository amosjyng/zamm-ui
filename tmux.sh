#!/bin/bash

SESSION_NAME="zamm"

tmux has-session -t $SESSION_NAME

if [ $? != 0 ]; then
    tmux new-session -d -s $SESSION_NAME 'yarn workspace gui storybook --ci'
    tmux split-window -h 'yarn tauri dev'
fi

tmux attach-session -t $SESSION_NAME
