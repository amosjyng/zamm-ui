<script lang="ts">
  export let title = "";
</script>

<div class="container">
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

  <div class="border-container">
    <div class="border-box"></div>
    <div class="info-box">
      <h2>{title}</h2>
      <slot />
    </div>
  </div>
</div>

<style>
  .container {
    position: relative;
    flex: 1;
    --cut: 1rem;
    padding: 1px;
  }

  .border-container {
    filter: drop-shadow(0px 0px 1px rgba(0, 0, 0, 0.4));
  }

  .border-box {
    width: 100%;
    height: 100%;
    position: absolute;
    filter: url(#round);
    z-index: 1;
  }

  .border-box::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--color-background);
    -webkit-mask:
      linear-gradient(-45deg, transparent 0 var(--cut), #fff 0) bottom right,
      linear-gradient(135deg, transparent 0 var(--cut), #fff 0) top left;
    -webkit-mask-size: 51% 100%;
    -webkit-mask-repeat: no-repeat;
    mask:
      linear-gradient(-45deg, transparent 0 var(--cut), #fff 0) bottom right,
      linear-gradient(135deg, transparent 0 var(--cut), #fff 0) top left;
    mask-size: 51% 100%;
    mask-repeat: no-repeat;
  }

  .info-box {
    position: relative;
    z-index: 2;
    padding: 1rem;
  }

  .info-box h2 {
    margin: -0.25rem 0 0 var(--cut);
  }
</style>
