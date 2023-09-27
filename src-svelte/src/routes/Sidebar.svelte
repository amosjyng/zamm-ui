<script lang="ts">
  import { page } from "$app/stores";
  import SidebarUi from "./SidebarUI.svelte";

  const currentRoute = $page.url.pathname;
</script>

<SidebarUi {currentRoute} />
