<script lang="ts">
  import MockAppLayout from "./MockAppLayout.svelte";
  import PageTransition from "../../routes/PageTransition.svelte";
  import { firstAppLoad, firstPageLoad } from "$lib/firstPageLoad";
  import { animationSpeed } from "$lib/preferences";

  firstAppLoad.set(true);
  firstPageLoad.set(true);
  animationSpeed.set(0.1);
</script>

<MockAppLayout>
  <PageTransition currentRoute="/storybook-demo">
    <slot />
  </PageTransition>
</MockAppLayout>
