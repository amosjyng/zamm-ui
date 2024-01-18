<script lang="ts">
  import InfoBox from "$lib/InfoBox.svelte";
  import TextInput from "$lib/controls/TextInput.svelte";
  import Button from "$lib/controls/Button.svelte";
  import { type ChatMessage, chat } from "$lib/bindings";
  import { snackbarError } from "$lib/snackbar/Snackbar.svelte";

  let currentMessage: string;
  let conversation: ChatMessage[] = [
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
      conversation.push(chatMessage);
      currentMessage = "";

      try {
        let llmCall = await chat("OpenAI", "gpt-3.5-turbo", null, conversation);
        conversation.push(llmCall.response.completion);
      } catch (err) {
        snackbarError(err as string);
      }
    }
  }
</script>

<InfoBox title="Chat">
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
  form {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }
</style>
