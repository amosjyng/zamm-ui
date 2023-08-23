"""Entry-point for ZAMM Python functionality."""

import json
import sys

from zamm.api.greet import greet, greet_method

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python -m zamm.main <json-args>")
        sys.exit(1)
    args_dict = json.loads(sys.argv[1])
    args = greet_method.args_type.from_dict(args_dict)
    response = greet(args)
    print(json.dumps(response.to_dict()))
