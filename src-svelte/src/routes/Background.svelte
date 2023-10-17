<script lang="ts">
  import BackgroundUI from "./BackgroundUI.svelte";
  import { unceasingAnimations } from "$lib/preferences";
</script>

<BackgroundUI bind:animated={$unceasingAnimations} />
