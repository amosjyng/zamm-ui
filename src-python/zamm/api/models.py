from typing import Any, TypeVar, Type, cast


T = TypeVar("T")


def from_str(x: Any) -> str:
    assert isinstance(x, str)
    return x


def to_class(c: Type[T], x: Any) -> dict:
    assert isinstance(x, c)
    return cast(Any, x).to_dict()


class GreetArgs:
    name: str

    def __init__(self, name: str) -> None:
        self.name = name

    @staticmethod
    def from_dict(obj: Any) -> "GreetArgs":
        assert isinstance(obj, dict)
        name = from_str(obj.get("name"))
        return GreetArgs(name)

    def to_dict(self) -> dict:
        result: dict = {}
        result["name"] = from_str(self.name)
        return result


class GreetResponse:
    greeting: str

    def __init__(self, greeting: str) -> None:
        self.greeting = greeting

    @staticmethod
    def from_dict(obj: Any) -> "GreetResponse":
        assert isinstance(obj, dict)
        greeting = from_str(obj.get("greeting"))
        return GreetResponse(greeting)

    def to_dict(self) -> dict:
        result: dict = {}
        result["greeting"] = from_str(self.greeting)
        return result


def greet_args_from_dict(s: Any) -> GreetArgs:
    return GreetArgs.from_dict(s)


def greet_args_to_dict(x: GreetArgs) -> Any:
    return to_class(GreetArgs, x)


def greet_response_from_dict(s: Any) -> GreetResponse:
    return GreetResponse.from_dict(s)


def greet_response_to_dict(x: GreetResponse) -> Any:
    return to_class(GreetResponse, x)
