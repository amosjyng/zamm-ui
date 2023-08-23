from typing import List, Any, TypeVar, Callable, Type, cast


T = TypeVar("T")


def from_list(f: Callable[[Any], T], x: Any) -> List[T]:
    assert isinstance(x, list)
    return [f(y) for y in x]


def from_str(x: Any) -> str:
    assert isinstance(x, str)
    return x


def to_class(c: Type[T], x: Any) -> dict:
    assert isinstance(x, c)
    return cast(Any, x).to_dict()


class SampleCall:
    request: List[str]
    response: str

    def __init__(self, request: List[str], response: str) -> None:
        self.request = request
        self.response = response

    @staticmethod
    def from_dict(obj: Any) -> "SampleCall":
        assert isinstance(obj, dict)
        request = from_list(from_str, obj.get("request"))
        response = from_str(obj.get("response"))
        return SampleCall(request, response)

    def to_dict(self) -> dict:
        result: dict = {}
        result["request"] = from_list(from_str, self.request)
        result["response"] = from_str(self.response)
        return result


def sample_call_from_dict(s: Any) -> SampleCall:
    return SampleCall.from_dict(s)


def sample_call_to_dict(x: SampleCall) -> Any:
    return to_class(SampleCall, x)
