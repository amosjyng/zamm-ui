<script lang="ts" context="module">
  export function formatUrl(url: string) {
    if (url.startsWith("https://github.com/")) {
      return url.slice(19, -1);
    }
    if (url.startsWith("https://")) {
      return url.slice(8);
    }
    if (url.startsWith("http://")) {
      return url.slice(7);
    }
    return url;
  }
</script>

<script lang="ts">
  export let name: string;
  export let url: string;
  export let urlDisplay = formatUrl(url);
</script>

<div class="creditor">
  <h4>{name}</h4>
  <a href={url} target="_blank" rel="noopener noreferrer">
    {urlDisplay}
  </a>
</div>

<style>
  .creditor {
    padding: 1rem;
  }

  h4 {
    font-weight: normal;
    margin: 0;
  }
</style>
