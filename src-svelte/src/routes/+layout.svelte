<script>
  import AppLayout from "./AppLayout.svelte";
  import PageTransition from "./PageTransition.svelte";
  import "./styles.css";

  export let data;
</script>

<AppLayout>
  <PageTransition currentRoute={data.url}>
    <slot />
  </PageTransition>
</AppLayout>
