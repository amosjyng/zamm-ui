"""API for greeting users."""

from zamm.api.methods import ApiMethod
from zamm.api.models import GreetArgs, GreetResponse


def greet(args: GreetArgs) -> GreetResponse:
    """Say hello-world."""
    return GreetResponse(
        greeting=f"Hello, {args.name}! You have been greeted from Python"
    )


greet_method = ApiMethod(GreetArgs, GreetResponse, greet)
