<script lang="ts">
  import getComponentId from "./label-id";

  export let subheading: string;
  const subinfoboxId = getComponentId("subinfobox");
</script>

<section class="sub-info-box" aria-labelledby={subinfoboxId}>
  <h3 id={subinfoboxId}>{subheading}</h3>
  <div class="content">
    <slot />
  </div>
</section>
