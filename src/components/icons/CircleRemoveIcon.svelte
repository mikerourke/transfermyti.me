<script lang="ts">
  export let color: string;
  export let height: number | undefined = undefined;
  export let width: number | undefined = undefined;
  export let style: string | undefined = undefined;
</script>

<svg viewBox="0 0 48 48" {height} {width} {style}>
  <path
    d="M14 22v4h20v-4H14zM24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm0 36c-8.82 0-16-7.18-16-16S15.18 8 24 8s16 7.18 16 16-7.18 16-16 16z"
    fill={color}
  />
</svg>
