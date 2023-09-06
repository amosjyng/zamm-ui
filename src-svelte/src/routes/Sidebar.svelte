<script>
  let icons = ["⚙️", "?"];
  let selectedIcon = "⚙️";
</script>

<header>
  <nav>
    {#each icons as icon}
      <div class="{icon === selectedIcon ? 'selected' : ''} icon rounded-l-md">
        {icon}
      </div>
    {/each}
  </nav>
</header>

<style>
  header {
    z-index: 1;
    padding-top: 0.75rem;
    background-color: #f4f4f4;
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: var(--sidebar-width);
  }

  header::before {
    content: "";
    position: fixed;
    top: 0;
    left: var(--sidebar-width);
    width: 50px;
    height: 100vh;
    box-shadow: calc(-1 * var(--shadow-offset)) 0 var(--shadow-blur) 0 #ccc;
    clip-path: inset(0px 0 0px -15px);
    pointer-events: none;
    z-index: 1;
  }

  .icon {
    width: var(--sidebar-width);
    height: var(--sidebar-width);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .selected {
    position: relative;
    background-color: white;
    box-shadow: 0 var(--shadow-offset) var(--shadow-blur) 0 #ccc;
    z-index: 2;
    clip-path: inset(-15px 0 -15px -15px);
  }
</style>
