from typing import Optional, Any, List, TypeVar, Callable, Type, cast


T = TypeVar("T")


def from_str(x: Any) -> str:
    assert isinstance(x, str)
    return x


def from_bool(x: Any) -> bool:
    assert isinstance(x, bool)
    return x


def from_none(x: Any) -> Any:
    assert x is None
    return x


def from_union(fs: List[Callable], x: Any) -> Any:
    for f in fs:
        try:
            return f(x)
        except:
            pass
    assert False


def from_list(f: Callable[[Any], T], x: Any) -> List[T]:
    assert isinstance(x, list)
    return [f(y) for y in x]


def to_class(c: Type[T], x: Any) -> dict:
    assert isinstance(x, c)
    return cast(Any, x).to_dict()


class Response:
    message: str
    success: Optional[bool]

    def __init__(self, message: str, success: Optional[bool]) -> None:
        self.message = message
        self.success = success

    @staticmethod
    def from_dict(obj: Any) -> "Response":
        assert isinstance(obj, dict)
        message = from_str(obj.get("message"))
        success = from_union([from_bool, from_none], obj.get("success"))
        return Response(message, success)

    def to_dict(self) -> dict:
        result: dict = {}
        result["message"] = from_str(self.message)
        if self.success is not None:
            result["success"] = from_union([from_bool, from_none], self.success)
        return result


class SampleCall:
    request: List[str]
    response: Response

    def __init__(self, request: List[str], response: Response) -> None:
        self.request = request
        self.response = response

    @staticmethod
    def from_dict(obj: Any) -> "SampleCall":
        assert isinstance(obj, dict)
        request = from_list(from_str, obj.get("request"))
        response = Response.from_dict(obj.get("response"))
        return SampleCall(request, response)

    def to_dict(self) -> dict:
        result: dict = {}
        result["request"] = from_list(from_str, self.request)
        result["response"] = to_class(Response, self.response)
        return result


def sample_call_from_dict(s: Any) -> SampleCall:
    return SampleCall.from_dict(s)


def sample_call_to_dict(x: SampleCall) -> Any:
    return to_class(SampleCall, x)
