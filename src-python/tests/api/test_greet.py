"""Test that greetings work."""

from tests.api.test_helpers import compare_io


def test_regular_greet() -> None:
    """Make sure a regular greeting works."""
    compare_io("api/sample-calls/greet.yaml")


def test_empty_greet() -> None:
    """Make sure an empty greeting works."""
    compare_io("api/sample-calls/greet_empty.yaml")
