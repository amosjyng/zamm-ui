<div class="credits-grid">
  <slot />
</div>

<style>
  .credits-grid {
    --side-padding: 0.8rem;
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.1rem;
    margin: -0.5rem 0 0;
  }

  /* this takes sidebar width into account */
  @media (min-width: 52rem) {
    .credits-grid {
      grid-template-columns: 1fr 1fr;
    }
  }
</style>
