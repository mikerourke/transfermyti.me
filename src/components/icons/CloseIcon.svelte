<script lang="ts">
  export let color: string;
  export let height: number | undefined = undefined;
  export let width: number | undefined = undefined;
  export let style: string | undefined = undefined;
</script>

<svg
  {height}
  {width}
  viewBox="0 0 24 24"
  aria-describedby="close-icon-desc"
  aria-labelledby="close-icon-title"
  {style}
>
  <title id="close-icon-title">Close Icon</title>
  <desc id="close-icon-desc">The letter X.</desc>
  <path
    d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"
    stroke="none"
    fill={color}
  />
</svg>
