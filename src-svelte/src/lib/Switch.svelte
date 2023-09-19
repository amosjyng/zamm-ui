<script lang="ts">
  import {
    Switch,
    SwitchLabel,
    SwitchGroup,
  } from "@rgossiaux/svelte-headlessui";

  export let label: string | undefined = undefined;
  export let toggledOn = false;
</script>

<div>
  <SwitchGroup class="switch-group">
    {#if label}
      <SwitchLabel>
        <div class="label">
          {label}
        </div>
      </SwitchLabel>
    {/if}
    <Switch
      bind:checked={toggledOn}
      class={toggledOn ? "button on" : "button off"}
    >
      <span class={toggledOn ? "toggle on" : "toggle off"}>ON / OFF</span>
    </Switch>
  </SwitchGroup>
</div>

<style>
  * :global(.switch-group) {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1rem;
  }

  * :global(.button) {
    border-color: pink;
  }

  * :global(.toggle.on) {
    color: green;
  }

  * :global(.toggle.off) {
    color: red;
  }
</style>
