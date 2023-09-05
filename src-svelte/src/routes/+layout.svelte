<script>
  import Sidebar from "./Sidebar.svelte";
  import "./styles.css";
</script>

<div class="app">
  <Sidebar />

  <main class="p-4">
    <slot />
  </main>
</div>

<style>
  main {
    margin-left: var(--sidebar-width);
  }
</style>
