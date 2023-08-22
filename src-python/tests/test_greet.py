"""Test that greetings work."""

from zamm.api import GreetArgs
from zamm.main import greet


def test_regular_greet() -> None:
    """Make sure a regular greeting works."""
    args = GreetArgs(name="World")
    response = greet(args)
    assert response.greeting == "Hello, World! You have been greeted from Python"


def test_empty_greet() -> None:
    """Make sure an empty greeting works."""
    args = GreetArgs(name="")
    response = greet(args)
    assert response.greeting == "Hello, ! You have been greeted from Python"
