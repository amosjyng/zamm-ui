<script lang="ts">
  export let title = "";
</script>

<div class="container">
  <div class="border-box"></div>
  <div class="background-box"></div>
  <svg
    style="visibility: hidden; position: absolute;"
    width="0"
    height="0"
    xmlns="http://www.w3.org/2000/svg"
    version="1.1"
  >
    <defs>
      <filter id="round">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
        <feColorMatrix
          in="blur"
          mode="matrix"
          values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
          result="goo"
        />
        <feComposite in="SourceGraphic" in2="goo" operator="atop" />
      </filter>
    </defs>
  </svg>

  <div class="info-box">
    <h2>{title}</h2>
    <slot />
  </div>
</div>

<style>
  .container {
    position: relative;
    flex: 1;
  }

  .border-box {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    filter: url(#round);
    z-index: 0;
  }

  .border-box::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--color-border);
    -webkit-mask:
      linear-gradient(-45deg, transparent 0 1rem, #fff 0) bottom right,
      linear-gradient(135deg, transparent 0 calc(1rem + 1px), #fff 0) top left;
    -webkit-mask-size: 51% 100%;
    -webkit-mask-repeat: no-repeat;
    mask:
      linear-gradient(-45deg, transparent 0 calc(1rem + 1px), #fff 0) bottom
        right,
      linear-gradient(135deg, transparent 0 calc(1rem + 1px), #fff 0) top left;
    mask-size: 51% 100%;
    mask-repeat: no-repeat;
  }

  .background-box {
    width: calc(100% - 1px);
    height: calc(100% - 1px);
    position: absolute;
    top: 1;
    left: 1;
    filter: url(#round);
    z-index: 1;
  }

  .background-box::before {
    content: "";
    position: absolute;
    top: 1px;
    left: 1px;
    right: 0;
    bottom: 0;
    background: white;
    -webkit-mask:
      linear-gradient(-45deg, transparent 0 1rem, #fff 0) bottom right,
      linear-gradient(135deg, transparent 0 1rem, #fff 0) top left;
    -webkit-mask-size: 51% 100%;
    -webkit-mask-repeat: no-repeat;
    mask:
      linear-gradient(-45deg, transparent 0 1rem, #fff 0) bottom right,
      linear-gradient(135deg, transparent 0 1rem, #fff 0) top left;
    mask-size: 51% 100%;
    mask-repeat: no-repeat;
  }

  .info-box {
    position: relative;
    z-index: 2;
    padding: 1rem;
  }

  .info-box h2 {
    margin: -0.25rem 0 0 1rem;
  }
</style>
