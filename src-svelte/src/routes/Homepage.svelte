<script lang="ts">
  import ApiKeysDisplay from "./ApiKeysDisplay.svelte";
  import Metadata from "./Metadata.svelte";
</script>

<section class="homepage-banner">
  <img src="/logo.png" alt="Robot typing on keyboard" />
  <div class="metadata-container">
    <Metadata />
  </div>
</section>

<section>
  <ApiKeysDisplay />
</section>

<style>
  .homepage-banner {
    display: flex;
    flex-direction: row;
    margin-bottom: 1rem;
  }

  .metadata-container {
    margin-left: 1rem;
    flex: 1;
  }

  img {
    height: 15rem;
    width: 19rem;
    object-fit: cover;
  }
</style>
