<script lang="ts">
  export let color: string;
  export let height: number | undefined = undefined;
  export let width: number | undefined = undefined;
  export let style: string | undefined = undefined;
</script>

<svg viewBox="0 0 512 512" {height} {width} {style}>
  <path
    d="M432,320H400a16,16,0,0,0-16,16V448H64V128H208a16,16,0,0,0,16-16V80 a16,16,0,0,0-16-16H48A48,48,0,0,0,0,112V464a48,48,0,0,0,48,48H400 a48,48,0,0,0,48-48V336A16,16,0,0,0,432,320ZM488,0h-128 c-21.37,0-32.05,25.91-17,41l35.73,35.73L135,320.37a24,24,0,0,0,0,34 L157.67,377a24,24,0,0,0,34,0L435.28,133.32,471,169 c15,15,41,4.5,41-17V24A24,24,0,0,0,488,0Z"
    fill={color}
  />
</svg>
