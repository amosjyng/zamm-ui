<script lang="ts">
  import InfoBox from "$lib/InfoBox.svelte";
  import TextInput from "$lib/controls/TextInput.svelte";
  import Button from "$lib/controls/Button.svelte";
  import { type ChatMessage, chat } from "$lib/bindings";
  import { snackbarError } from "$lib/snackbar/Snackbar.svelte";

  let currentMessage: string;
  export let conversation: ChatMessage[] = [
    {
      role: "System",
      text: "You are ZAMM, a chat program. Respond in first person.",
    },
  ];

  async function sendChat() {
    const message = currentMessage.trim();
    if (message) {
      const chatMessage: ChatMessage = {
        role: "Human",
        text: message,
      };
      conversation = [...conversation, chatMessage];
      currentMessage = "";

      try {
        let llmCall = await chat("OpenAI", "gpt-3.5-turbo", null, conversation);
        conversation = [...conversation, llmCall.response.completion];
      } catch (err) {
        snackbarError(err as string);
      }
    }
  }
</script>

<InfoBox title="Chat">
  <div class="conversation" role="list">
    {#if conversation.length > 1}
      {#each conversation.slice(1) as message}
        <div class:message class={message.role.toLowerCase()} role="listitem">
          <div class="arrow"></div>
          <div class="text">
            {message.text}
          </div>
        </div>
      {/each}
    {/if}
  </div>

  <form on:submit|preventDefault={sendChat}>
    <label for="message" class="accessibility-only">Chat with the AI:</label>
    <TextInput
      name="message"
      placeholder="Type your message here..."
      bind:value={currentMessage}
    />
    <Button text="Send" />
  </form>
</InfoBox>

<style>
  .conversation {
    margin-bottom: 1rem;
  }

  .message {
    --message-color: gray;
    --arrow-size: 0.5rem;
    position: relative;
  }

  .message .text {
    margin: 0.5rem var(--arrow-size);
    border-radius: var(--corner-roundness);
    width: fit-content;
    max-width: 60%;
    padding: 0.75rem;
    box-sizing: border-box;
    background-color: var(--message-color);
    white-space: pre-line;
  }

  .message .arrow {
    position: absolute;
    width: 0;
    height: 0;
    bottom: var(--arrow-size);
    border: var(--arrow-size) solid transparent;
  }

  .message.human {
    --message-color: #e5ffe5;
  }

  .message.human .text {
    margin-left: auto;
  }

  .message.human .arrow {
    float: right;
    right: calc(-1 * var(--arrow-size));
    border-left-color: var(--message-color);
  }

  .message.ai {
    --message-color: #e5e5ff;
  }

  .message.ai .text {
    margin-right: auto;
  }

  .message.ai .arrow {
    float: left;
    left: calc(-1 * var(--arrow-size));
    border-right-color: var(--message-color);
  }

  form {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }
</style>
