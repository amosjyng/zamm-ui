<script lang="ts">
  import type { ChatMessage } from "$lib/bindings";
  export let message: ChatMessage;
</script>

<div class:message class={message.role.toLowerCase()} role="listitem">
  <div class="arrow"></div>
  <div class="text">
    {message.text}
  </div>
</div>

<style>
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
</style>
