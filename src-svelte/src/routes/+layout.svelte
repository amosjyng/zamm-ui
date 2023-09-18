<script>
  import Sidebar from "./Sidebar.svelte";
  import Background from "./Background.svelte";
  import "./styles.css";
</script>

<div class="app">
  <div class="background">
    <Background />
  </div>
  <Sidebar />

  <main>
    <slot />
  </main>
</div>

<style>
  .background {
    z-index: -100;
  }

  main {
    padding: 0.5em;
    margin-left: var(--sidebar-width);
    z-index: 100;
  }
</style>
