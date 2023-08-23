"""Helpers for generic API tests."""

import json
from pathlib import Path

import yaml
from zamm.execution import handle_commandline_args

from tests.api.sample_call import SampleCall


def compare_io(filename: str) -> None:
    """Compare input and output for generic commands."""
    sample_call = SampleCall.from_dict(yaml.safe_load(Path(filename).read_text()))
    response = handle_commandline_args(*sample_call.request)
    assert json.loads(response) == json.loads(sample_call.response)
