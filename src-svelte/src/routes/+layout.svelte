<script>
  import Header from "./Header.svelte";
  import "./styles.css";
  import "@fontsource/teko";
  import "@fontsource/orbitron";
  import "@fontsource/kanit";
  import "@fontsource/play";
  import "@fontsource/russo-one";
  import "@fontsource/changa";
  import "@fontsource/alata";
  import "@fontsource/saira";
</script>

<div class="app">
  <Header />

  <main>
    <slot />
  </main>
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  main {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 1rem;
    width: 100%;
    max-width: 64rem;
    margin: 0 auto;
    box-sizing: border-box;
  }
</style>
