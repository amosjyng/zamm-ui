<script lang="ts">
  import InfoBox from "$lib/InfoBox.svelte";
  import TextInput from "$lib/controls/TextInput.svelte";
  import Button from "$lib/controls/Button.svelte";
  import Message from "./Message.svelte";
  import { type ChatMessage, chat } from "$lib/bindings";
  import { snackbarError } from "$lib/snackbar/Snackbar.svelte";
  import { onMount } from "svelte";

  let currentMessage: string;
  export let conversation: ChatMessage[] = [
    {
      role: "System",
      text: "You are ZAMM, a chat program. Respond in first person.",
    },
  ];
  let conversationContainer: HTMLDivElement | undefined = undefined;
  let conversationView: HTMLDivElement | undefined = undefined;

  onMount(() => {
    resizeConversationView();
    window.addEventListener("resize", resizeConversationView);

    return () => {
      window.removeEventListener("resize", resizeConversationView);
    };
  });

  function showChatBottom() {
    if (conversationView) {
      conversationView.scrollTop = conversationView.scrollHeight;
    }
  }

  function resizeConversationView() {
    if (conversationView) {
      conversationView.style.maxHeight = "8rem";
      requestAnimationFrame(() => {
        if (conversationView && conversationContainer) {
          conversationView.style.maxHeight = `${conversationContainer.clientHeight}px`;
          showChatBottom();
        }
      });
    }
  }

  async function sendChat() {
    const message = currentMessage.trim();
    if (message) {
      const chatMessage: ChatMessage = {
        role: "Human",
        text: message,
      };
      conversation = [...conversation, chatMessage];
      currentMessage = "";
      setTimeout(showChatBottom, 50);

      try {
        let llmCall = await chat("OpenAI", "gpt-3.5-turbo", null, conversation);
        conversation = [...conversation, llmCall.response.completion];
        setTimeout(showChatBottom, 50);
      } catch (err) {
        snackbarError(err as string);
      }
    }
  }
</script>

<InfoBox title="Chat" fullHeight>
  <div class="chat-container">
    <div class="conversation-container" bind:this={conversationContainer}>
      <div class="conversation" role="list" bind:this={conversationView}>
        {#if conversation.length > 1}
          {#each conversation.slice(1) as message}
            <Message {message} />
          {/each}
        {:else}
          <p class="empty-conversation">
            This conversation is currently empty.<br />Get it started by typing
            a message below.
          </p>
        {/if}
      </div>
    </div>

    <form autocomplete="off" on:submit|preventDefault={sendChat}>
      <label for="message" class="accessibility-only">Chat with the AI:</label>
      <TextInput
        name="message"
        placeholder="Type your message here..."
        bind:value={currentMessage}
      />
      <Button text="Send" />
    </form>
  </div>
</InfoBox>

<style>
  .chat-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .conversation-container {
    flex-grow: 1;
  }

  .conversation {
    max-height: 8rem;
    overflow-y: scroll;
  }

  .empty-conversation {
    color: var(--color-faded);
    font-size: 0.85rem;
    font-style: italic;
    text-align: center;
  }

  form {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }
</style>
