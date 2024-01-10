"""API for sending LLMs a single prompt."""

import os
from typing import cast

from langchain_community.callbacks import get_openai_callback
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_core.messages import BaseMessage as LCBaseMessage
from langchain_core.outputs import ChatGeneration
from langchain_core.prompt_values import ChatPromptValue
from langchain_openai import ChatOpenAI

from zamm.api.methods import ApiMethod
from zamm.api.models import ChatArgs, ChatMessage, ChatResponse, TokenMetadata


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
    with get_openai_callback() as cb:
        result = cast(ChatGeneration, llm.generate_prompt([prompt]).generations[0][0])
        return ChatResponse(
            response=ChatMessage(message=result.text, role="AI"),
            tokens=TokenMetadata(
                completion=cb.completion_tokens,
                prompt=cb.prompt_tokens,
                total=cb.total_tokens,
                cost=cb.total_cost,
            ),
        )


chat_method = ApiMethod(ChatArgs, ChatResponse, chat)
