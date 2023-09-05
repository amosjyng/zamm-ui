<script>
  let icons = ["⚙️"];
</script>

<header>
  <nav>
    {#each icons as icon}
      <div class="icon-box">
        {icon}
      </div>
    {/each}
  </nav>
</header>

<style>
  header {
    position: fixed;
    top: 0;
    left: 0;
    width: var(--sidebar-width);
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .icon-box {
    width: var(--sidebar-width);
    height: var(--sidebar-width);
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
