from typing import Any, List, Optional, TypeVar, Callable, Type, cast


T = TypeVar("T")


def from_str(x: Any) -> str:
    assert isinstance(x, str)
    return x


def from_list(f: Callable[[Any], T], x: Any) -> List[T]:
    assert isinstance(x, list)
    return [f(y) for y in x]


def from_float(x: Any) -> float:
    assert isinstance(x, (float, int)) and not isinstance(x, bool)
    return float(x)


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


def to_class(c: Type[T], x: Any) -> dict:
    assert isinstance(x, c)
    return cast(Any, x).to_dict()


def to_float(x: Any) -> float:
    assert isinstance(x, float)
    return x


def from_int(x: Any) -> int:
    assert isinstance(x, int) and not isinstance(x, bool)
    return x


class ChatMessage:
    message: str
    role: str

    def __init__(self, message: str, role: str) -> None:
        self.message = message
        self.role = role

    @staticmethod
    def from_dict(obj: Any) -> "ChatMessage":
        assert isinstance(obj, dict)
        message = from_str(obj.get("message"))
        role = from_str(obj.get("role"))
        return ChatMessage(message, role)

    def to_dict(self) -> dict:
        result: dict = {}
        result["message"] = from_str(self.message)
        result["role"] = from_str(self.role)
        return result


class ChatArgs:
    api_key: str
    llm: str
    prompt: List[ChatMessage]
    provider: str
    temperature: Optional[float]

    def __init__(
        self,
        api_key: str,
        llm: str,
        prompt: List[ChatMessage],
        provider: str,
        temperature: Optional[float],
    ) -> None:
        self.api_key = api_key
        self.llm = llm
        self.prompt = prompt
        self.provider = provider
        self.temperature = temperature

    @staticmethod
    def from_dict(obj: Any) -> "ChatArgs":
        assert isinstance(obj, dict)
        api_key = from_str(obj.get("api_key"))
        llm = from_str(obj.get("llm"))
        prompt = from_list(ChatMessage.from_dict, obj.get("prompt"))
        provider = from_str(obj.get("provider"))
        temperature = from_union([from_float, from_none], obj.get("temperature"))
        return ChatArgs(api_key, llm, prompt, provider, temperature)

    def to_dict(self) -> dict:
        result: dict = {}
        result["api_key"] = from_str(self.api_key)
        result["llm"] = from_str(self.llm)
        result["prompt"] = from_list(lambda x: to_class(ChatMessage, x), self.prompt)
        result["provider"] = from_str(self.provider)
        if self.temperature is not None:
            result["temperature"] = from_union([to_float, from_none], self.temperature)
        return result


class TokenMetadata:
    completion: int
    cost: float
    prompt: int
    total: int

    def __init__(self, completion: int, cost: float, prompt: int, total: int) -> None:
        self.completion = completion
        self.cost = cost
        self.prompt = prompt
        self.total = total

    @staticmethod
    def from_dict(obj: Any) -> "TokenMetadata":
        assert isinstance(obj, dict)
        completion = from_int(obj.get("completion"))
        cost = from_float(obj.get("cost"))
        prompt = from_int(obj.get("prompt"))
        total = from_int(obj.get("total"))
        return TokenMetadata(completion, cost, prompt, total)

    def to_dict(self) -> dict:
        result: dict = {}
        result["completion"] = from_int(self.completion)
        result["cost"] = to_float(self.cost)
        result["prompt"] = from_int(self.prompt)
        result["total"] = from_int(self.total)
        return result


class ChatResponse:
    response: ChatMessage
    tokens: TokenMetadata

    def __init__(self, response: ChatMessage, tokens: TokenMetadata) -> None:
        self.response = response
        self.tokens = tokens

    @staticmethod
    def from_dict(obj: Any) -> "ChatResponse":
        assert isinstance(obj, dict)
        response = ChatMessage.from_dict(obj.get("response"))
        tokens = TokenMetadata.from_dict(obj.get("tokens"))
        return ChatResponse(response, tokens)

    def to_dict(self) -> dict:
        result: dict = {}
        result["response"] = to_class(ChatMessage, self.response)
        result["tokens"] = to_class(TokenMetadata, self.tokens)
        return result


class ChatMethod:
    args: ChatArgs
    response: ChatResponse

    def __init__(self, args: ChatArgs, response: ChatResponse) -> None:
        self.args = args
        self.response = response

    @staticmethod
    def from_dict(obj: Any) -> "ChatMethod":
        assert isinstance(obj, dict)
        args = ChatArgs.from_dict(obj.get("args"))
        response = ChatResponse.from_dict(obj.get("response"))
        return ChatMethod(args, response)

    def to_dict(self) -> dict:
        result: dict = {}
        result["args"] = to_class(ChatArgs, self.args)
        result["response"] = to_class(ChatResponse, self.response)
        return result


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


def chat_method_from_dict(s: Any) -> ChatMethod:
    return ChatMethod.from_dict(s)


def chat_method_to_dict(x: ChatMethod) -> Any:
    return to_class(ChatMethod, x)


def greet_args_from_dict(s: Any) -> GreetArgs:
    return GreetArgs.from_dict(s)


def greet_args_to_dict(x: GreetArgs) -> Any:
    return to_class(GreetArgs, x)


def greet_response_from_dict(s: Any) -> GreetResponse:
    return GreetResponse.from_dict(s)


def greet_response_to_dict(x: GreetResponse) -> Any:
    return to_class(GreetResponse, x)
