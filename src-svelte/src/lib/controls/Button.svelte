<script lang="ts">
  export let text: string;
</script>

<button class="outer" type="submit">
  <div class="inner">{text}</div>
</button>

<style>
  .outer,
  .inner {
    --cut: 7px;
    --background-color: var(--color-background);
    --border-color: #ccc;
    --border: 0.15rem;
    --diagonal-border: calc(var(--border) * 0.8);
    font-size: 0.9rem;
    font-family: var(--font-body);
    border: var(--border) solid var(--border-color);
    text-transform: uppercase;
    background:
      linear-gradient(
          -45deg,
          var(--border-color) 0 calc(var(--cut) + var(--diagonal-border)),
          var(--background-color) 0
        )
        bottom right / 50% 100%,
      linear-gradient(
          135deg,
          var(--border-color) 0 calc(var(--cut) + var(--diagonal-border)),
          var(--background-color) 0
        )
        top left / 50% 100%;
    background-origin: border-box;
    background-repeat: no-repeat;
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
    transition-property: filter, transform;
    transition: calc(0.5 * var(--standard-duration)) ease-out;
  }

  .inner {
    padding: 5px 10px;
  }

  .inner:hover {
    filter: brightness(1.05);
  }

  .inner:active {
    transform: translateY(0.08rem) scale(0.98);
  }

  .outer {
    --background-color: #eee;
    --border: 2px;
    --diagonal-border: 2.5px;
    --cut: 8px;
    padding: 1px;
    display: inline-block;
  }
</style>
