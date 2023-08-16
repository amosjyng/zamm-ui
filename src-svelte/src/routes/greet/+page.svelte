<script lang="ts">
  import { Command } from "@tauri-apps/api/shell";

  let name = "";
  let greetMsg = "";

  async function greet() {
    const command = Command.sidecar("binaries/zamm-python", [name]);
    const result = await command.execute();
    greetMsg = result.stdout + " via JavaScript!";
  }
</script>

<div>
  <form class="row" on:submit|preventDefault={greet}>
    <input id="greet-input" placeholder="Enter a name..." bind:value={name} />
    <button type="submit">Greet</button>
  </form>
  <p id="greet-message" role="paragraph">{greetMsg}</p>
</div>
