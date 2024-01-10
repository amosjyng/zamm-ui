"""Test that chat invocations work."""

import vcr_langchain as vcr

from tests.api.test_helpers import compare_io


@vcr.use_cassette()
def test_openai_chat() -> None:
    """Make sure a regular chat message works."""
    compare_io("api/sample-calls/chat.yaml")
