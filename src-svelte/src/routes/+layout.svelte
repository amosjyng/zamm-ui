<script>
  import Sidebar from "./Sidebar.svelte";
  import "./styles.css";
</script>

<div class="app">
  <Sidebar />

  <main>
    <slot />
  </main>
</div>

<style>
  main {
    margin-left: var(--sidebar-width);
    padding: 20px;
  }
</style>
