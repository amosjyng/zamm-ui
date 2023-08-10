"""Entry-point for ZAMM Python functionality."""

import sys


def greet(name: str) -> None:
    """Say hello-world."""
    print(f"Hello, {name}! You have been greeted from Python")


greet(sys.argv[1] if len(sys.argv) > 1 else "World")
