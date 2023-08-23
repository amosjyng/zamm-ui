"""Entry-point for ZAMM Python functionality."""

import sys

from zamm.execution import handle_commandline_args

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python -m zamm.main <command> <json-args>")
        sys.exit(1)
    print(handle_commandline_args(*sys.argv[1:]))
