<script lang="ts">
  export let color: string;
  export let height: number | undefined = undefined;
  export let width: number | undefined = undefined;
</script>

<svg
  viewBox="0 0 448 512"
  {height}
  {width}
  aria-describedby="linkedin-icon-desc"
  aria-labelledby="linkedin-icon-title"
>
  <title id="linkedin-icon-title">LinkedIn Icon</title>
  <desc id="linkedin-icon-desc">
    The LinkedIn logo taken from https://github.com/FortAwesome/Font-Awesome
  </desc>
  <path
    d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416 c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69 V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96 c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4 V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2 h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z"
    fill={color}
  />
</svg>
