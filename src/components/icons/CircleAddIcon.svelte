<script lang="ts">
  export let color: string;
  export let height: number | undefined = undefined;
  export let width: number | undefined = undefined;
</script>

<svg
  viewBox="0 0 48 48"
  {height}
  {width}
  aria-describedby="circle-add-icon-desc"
  aria-labelledby="circle-add-icon-title"
>
  <title id="circle-add-icon-title">Circle with Plus Sign Icon</title>
  <desc id="circle-add-icon-desc">
    A circle with a plus sign in the middle taken from
    https://github.com/google/material-design-icons.
  </desc>
  <path
    d="M26 14h-4v8h-8v4h8v8h4v-8h8v-4h-8v-8zM24 4C12.95 4 4 12.95 4 24 s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm0 36c-8.82 0-16-7.18-16-16S15.18 8 24 8s16 7.18 16 16-7.18 16-16 16z"
    fill={color}
  />
</svg>
