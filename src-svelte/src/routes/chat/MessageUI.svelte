<script lang="ts">
  export let role: "System" | "Human" | "AI";
</script>

<div class:message={true} class={role.toLowerCase()} role="listitem">
  <div class="arrow"></div>
  <div class="text">
    <slot />
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
    bottom: 0.75rem;
    border: var(--arrow-size) solid transparent;
  }

  .message.human {
    --message-color: #e5ffe5;
  }

  .message.human .text {
    margin-left: auto;
  }

  .message.human .arrow {
    right: 0;
    border-right: none;
    border-left-color: var(--message-color);
  }

  .message.ai {
    --message-color: #e5e5ff;
  }

  .message.ai .text {
    margin-right: auto;
  }

  .message.ai .arrow {
    left: 0;
    border-left: none;
    border-right-color: var(--message-color);
  }
</style>
