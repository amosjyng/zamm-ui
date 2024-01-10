"""API methods for the Python CLI."""

from zamm.api.chat import chat_method
from zamm.api.greet import greet_method
from zamm.api.methods import ApiMethod

__all__ = ["greet_method", "chat_method", "ApiMethod"]
