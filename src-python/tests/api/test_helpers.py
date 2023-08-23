"""Helpers for generic API tests."""

import json
from pathlib import Path

from zamm.api.methods import ApiMethod


def read_json(filename: str) -> dict:
    """Read JSON dict from a file."""
    return json.loads(Path(filename).read_text())


def compare_io(file_prefix: str, api_method: ApiMethod) -> None:
    """Compare input and output for generic commands."""
    args_file = f"{file_prefix}_args.json"
    response_file = f"{file_prefix}_response.json"
    args = api_method.args_type.from_dict(read_json(args_file))
    response = api_method.invoke(args)
    assert response.to_dict() == read_json(response_file)
