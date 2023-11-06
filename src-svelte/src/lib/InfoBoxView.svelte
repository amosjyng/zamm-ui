<script lang="ts">
  import InfoBox from "./InfoBox.svelte";
  import { firstPageLoad } from "$lib/firstPageLoad";

  firstPageLoad.set(true);
</script>

<InfoBox {...$$restProps}>
  <p>
    How do we know that even the realest of realities wouldn't be subjective, in
    the final analysis? Nobody can prove his existence, can he? &mdash; <em
      >Simulacron 3</em
    >
  </p>
</InfoBox>
