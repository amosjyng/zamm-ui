<script>
  import Sidebar from "./Sidebar.svelte";
  import "./styles.css";
</script>

<div class="app">
  <Sidebar />

  <main class="h-screen">
    <slot />
  </main>
</div>

<style>
  main {
    padding: 0.5em;
    margin-left: var(--sidebar-width);
  }
</style>
