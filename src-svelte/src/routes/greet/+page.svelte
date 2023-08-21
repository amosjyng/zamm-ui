<script lang="ts">
  import { greet } from "$lib/bindings";

  let name = "";
  let greetMsg = "";

  async function trigger_greet() {
    const result = await greet(name);
    greetMsg = result + " via TypeScript!";
  }
</script>

<div>
  <form class="row" on:submit|preventDefault={trigger_greet}>
    <input id="greet-input" placeholder="Enter a name..." bind:value={name} />
    <button type="submit">Greet</button>
  </form>
  <p id="greet-message" role="paragraph">{greetMsg}</p>
</div>
