"""API for sending LLMs a single prompt."""

import os
from typing import Any, cast

from langchain_community.callbacks import OpenAICallbackHandler
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_core.messages import BaseMessage as LCBaseMessage
from langchain_core.outputs import ChatGeneration, LLMResult
from langchain_core.prompt_values import ChatPromptValue
from langchain_openai import ChatOpenAI

from zamm.api.methods import ApiMethod
from zamm.api.models import ChatArgs, ChatMessage, ChatResponse, TokenMetadata


class CustomOpenAICallbackHandler(OpenAICallbackHandler):
    """Custom OpenAI callback handler."""

    model_name: str | None

    def __init__(self) -> None:
        """Initialize the OpenAI callback handler."""
        super().__init__()
        self.model_name = None

    def on_llm_end(self, response: LLMResult, **kwargs: Any) -> None:
        """Collect remaining metadata."""
        super().on_llm_end(response, **kwargs)
        self.model_name = response.llm_output["model_name"]


def to_langchain_prompt(messages: list[ChatMessage]) -> ChatPromptValue:
    """Convert a list of our ChatMessage to a Langchain prompt."""
    lc_messages: list[LCBaseMessage] = []
    for message in messages:
        if message.role == "Human":
            lc_messages.append(HumanMessage(content=message.message))
        elif message.role == "AI":
            lc_messages.append(AIMessage(content=message.message))
        elif message.role == "System":
            lc_messages.append(SystemMessage(content=message.message))
        else:
            raise ValueError(f"Unknown role {message.role}")
    return ChatPromptValue(messages=lc_messages)


def chat(args: ChatArgs) -> ChatResponse:
    """Send a chat message to the LLM."""
    if args.provider == "OpenAI":
        if "ZAMM_DUMMY_API_KEYS" in os.environ:
            api_key = os.environ["OPENAI_API_KEY"]
        else:
            api_key = args.api_key
        llm = ChatOpenAI(api_key=api_key, model=args.llm, temperature=args.temperature)
    else:
        raise NotImplementedError(f"Provider {args.provider} not yet supported")

    prompt = to_langchain_prompt(args.prompt)
    cb = CustomOpenAICallbackHandler()
    result = cast(
        ChatGeneration, llm.generate_prompt([prompt], callbacks=[cb]).generations[0][0]
    )
    return ChatResponse(
        llm=cb.model_name or args.llm,
        response=ChatMessage(message=result.text, role="AI"),
        tokens=TokenMetadata(
            completion=cb.completion_tokens,
            prompt=cb.prompt_tokens,
            total=cb.total_tokens,
            cost=cb.total_cost,
        ),
    )


chat_method = ApiMethod(ChatArgs, ChatResponse, chat)
