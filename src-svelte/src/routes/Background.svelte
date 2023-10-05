<script lang="ts">
  import BackgroundUI from "./BackgroundUI.svelte";
  import { unceasingAnimations } from "../preferences";
</script>

<BackgroundUI bind:animated={$unceasingAnimations} />
