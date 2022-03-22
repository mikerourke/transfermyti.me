<script lang="ts">
  export let color: string;
  export let height: number | undefined = undefined;
  export let width: number | undefined = undefined;
</script>

<svg
  viewBox="0 0 1792 1536"
  {height}
  {width}
  aria-describedby="heart-icon-desc"
  aria-labelledby="heart-icon-title"
>
  <title id="heart-icon-title">Heart Icon</title>
  <desc id="heart-icon-desc">
    A filled-in heart (the cartoon kind, not one with ventricles).
  </desc>
  <path
    d="M896 1536q-26 0-44-18L228 916q-10-8-27.5-26 T145 824.5 77 727 23.5 606 0 468q0-220 127-344T478 0 q62 0 126.5 21.5t120 58T820 148t76 68q36-36 76-68 t95.5-68.5 120-58T1314 0q224 0 351 124t127 344 q0 221-229 450l-623 600q-18 18-44 18z"
    fill={color}
  />
</svg>
