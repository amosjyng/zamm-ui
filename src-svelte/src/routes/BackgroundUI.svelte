<script lang="ts">
  export let animated = false;
  let duration: number;

  $: duration = animated ? 15 : 0;
</script>

<div class="background" style="--base-duration: {duration}s;">
  <div class="bg"></div>
  <div class="bg bg2"></div>
  <div class="bg bg3"></div>
</div>

<style>
  .background {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: -100;
    --base-position: 55%;
    --base-duration: 0;
    --max-left: 40%;
    --max-right: 65%;
  }

  .bg {
    --position: var(--base-position);
    --duration: var(--base-duration);
    --color-overlay: #49d8d7;
    --go-left: calc(var(--max-left) - var(--position));
    --go-right: calc(var(--max-right) - var(--position));
    animation: slide var(--duration) ease-in-out infinite alternate;
    background-image: linear-gradient(
      120deg,
      transparent var(--position),
      var(--color-overlay) var(--position),
      transparent calc(var(--position) + 10%)
    );
    bottom: 0;
    left: -100%;
    opacity: 0.1;
    position: fixed;
    right: -100%;
    top: 0%;
    z-index: -1;
  }

  .bg2 {
    --duration: calc(1.33 * var(--base-duration));
    --color-overlay: #4949d8;
    --position: calc(var(--base-position) + 30vw);
  }

  .bg3 {
    --duration: calc(1.66 * var(--base-duration));
    --color-overlay: #49d849;
    --position: calc(var(--base-position) - 30vw);
  }

  @keyframes slide {
    0% {
      transform: translateX(var(--go-left));
    }
    100% {
      transform: translateX(var(--go-right));
    }
  }
</style>
