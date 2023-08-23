"""Execution logic for commandline arguments."""

import json
import sys

from zamm.api.greet import greet, greet_method

METHODS = {
    "greet": greet_method,
}


def handle_commandline_args(method_name: str, args_dict_str: str) -> str:
    """Handle commandline arguments."""
    method = METHODS[method_name]
    args_dict = json.loads(args_dict_str)
    args = method.args_type.from_dict(args_dict)
    response = method.invoke(args)
    return json.dumps(response.to_dict())


if __name__ == "__main__":
    args_dict = json.loads(sys.argv[1])
    args = greet_method.args_type.from_dict(args_dict)
    response = greet(args)
    print(json.dumps(response.to_dict()))
