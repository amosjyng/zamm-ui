"""Test that greetings work."""

from zamm.main import greet_method

from tests.api.test_helpers import compare_io


def compare_greet_io(file_prefix: str) -> None:
    """Compare input and output for the greet command."""
    compare_io(file_prefix, greet_method)


def test_regular_greet() -> None:
    """Make sure a regular greeting works."""
    compare_greet_io("api/sample-calls/greet")


def test_empty_greet() -> None:
    """Make sure an empty greeting works."""
    compare_greet_io("api/sample-calls/greet_empty")
