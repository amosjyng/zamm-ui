"""Test that chat invocations work."""

import vcr_langchain as vcr

from tests.api.test_helpers import compare_io


@vcr.use_cassette()
def test_openai_chat() -> None:
    """Make sure a regular chat message works."""
    compare_io("api/sample-calls/chat.yaml")


@vcr.use_cassette()
def test_openai_chat_reply() -> None:
    """Make sure a response to an AI message works."""
    compare_io("api/sample-calls/chat_reply.yaml")
