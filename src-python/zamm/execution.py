"""Execution logic for commandline arguments."""

import json

from zamm.api import ApiMethod, greet_method

METHODS: dict[str, ApiMethod] = {
    "greet": greet_method,
}


def handle_commandline_args(method_name: str, args_dict_str: str) -> str:
    """Handle commandline arguments."""
    method = METHODS[method_name]
    args_dict = json.loads(args_dict_str)
    args = method.args_type.from_dict(args_dict)
    response = method.invoke(args)
    return json.dumps(response.to_dict())
