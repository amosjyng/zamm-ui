<script lang="ts">
  import IconSettings from "~icons/ion/settings";
  import IconChat from "~icons/ph/chat-dots-fill";
  import IconDashboard from "~icons/material-symbols/monitor-heart";

  const routes: App.Route[] = [
    {
      name: "Home",
      path: "/",
      icon: IconDashboard,
    },
    {
      name: "Chat",
      path: "/chat",
      icon: IconChat,
    },
    {
      name: "Settings",
      path: "/settings",
      icon: IconSettings,
    },
  ];

  export let currentRoute: string;
</script>

<header>
  <svg
    version="1.1"
    style="visibility: hidden; position: absolute;"
    width="0"
    height="0"
  >
    <filter id="inset-shadow">
      <feOffset dx="0" dy="0" />
      <feGaussianBlur stdDeviation="1" result="offset-blur" />
      <feComposite
        operator="out"
        in="SourceGraphic"
        in2="offset-blur"
        result="inverse"
      />
      <feFlood flood-color="#555" flood-opacity=".95" result="color" />
      <feComposite operator="in" in="color" in2="inverse" result="shadow" />
      <feComposite operator="over" in="shadow" in2="SourceGraphic" />
    </filter>

    <filter id="inset-shadow-selected">
      <feOffset dx="0" dy="0" />
      <feGaussianBlur stdDeviation="2" result="offset-blur" />
      <feComposite
        operator="out"
        in="SourceGraphic"
        in2="offset-blur"
        result="inverse"
      />
      <feFlood flood-color="#002966" flood-opacity=".95" result="color" />
      <feComposite operator="in" in="color" in2="inverse" result="shadow" />
      <feComposite operator="over" in="shadow" in2="SourceGraphic" />
    </filter>
  </svg>

  <nav>
    {#each routes as route}
      <a
        aria-current={route.path === currentRoute ? "page" : undefined}
        class="icon"
        title={route.name}
        href={route.path}
      >
        <svelte:component this={route.icon} />
      </a>
    {/each}
  </nav>
</header>

<style>
  header {
    z-index: 1;
    padding-top: 0.75rem;
    padding-left: var(--sidebar-left-padding);
    /* this is the icon size, not the sidebar-width, because
    sidebar-width is supposed to control the total width of the sidebar,
    whereas CSS width only controls the sidebar's content area */
    width: var(--sidebar-icon-size);
    background-color: #f4f4f4;
    position: fixed;
    clip-path: inset(0 0 0 0);
    top: 0;
    left: 0;
    height: 100vh;
  }

  header::before {
    content: "";
    position: fixed;
    top: 0;
    left: var(--sidebar-width);
    width: 50px;
    height: 100vh;
    box-shadow: calc(-1 * var(--shadow-offset)) 0 var(--shadow-blur) 0 #ccc;
    pointer-events: none;
    z-index: 1;
  }

  .icon {
    width: var(--sidebar-icon-size);
    height: var(--sidebar-icon-size);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon > :global(:only-child) {
    font-size: calc(0.5 * var(--sidebar-icon-size));
    color: #aaa;
    filter: url(#inset-shadow);
  }

  .icon[aria-current="page"] > :global(:only-child) {
    color: #1a75ff;
    filter: url(#inset-shadow-selected);
  }

  .icon[aria-current="page"] {
    border-top-left-radius: var(--corner-roundness);
    border-bottom-left-radius: var(--corner-roundness);
    position: relative;
    background-color: var(--color-background);
    box-shadow: 0 var(--shadow-offset) var(--shadow-blur) 0 #ccc;
    z-index: 2;
  }

  .icon[aria-current="page"]::before,
  .icon[aria-current="page"]::after {
    content: "";
    height: 1rem;
    width: 1rem;
    position: absolute;
    right: 0;
  }

  .icon[aria-current="page"]::before {
    bottom: var(--sidebar-icon-size);
    border-radius: 0 0 var(--corner-roundness) 0;
    box-shadow: 0 0.375rem 0 0 var(--color-background);
  }

  .icon[aria-current="page"]::after {
    top: var(--sidebar-icon-size);
    border-radius: 0 var(--corner-roundness) 0 0;
    box-shadow: 0 -0.375rem 0 0 var(--color-background);
  }
</style>
