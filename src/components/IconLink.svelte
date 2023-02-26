<!--suppress TypeScriptCheckImport -->
<script lang="ts">
  import Icon, { type IconName } from "~/components/Icon.svelte";

  import classes from "./IconLink.module.css";

  export let href: string;
  export let iconName: IconName;
  export let label: string;
  export let color: string = "var(--color-white)";
  export let height: number | undefined = 24;
  export let width: number | undefined = 24;
</script>

<a {href} class={classes.iconLink} aria-label={label}>
  <Icon name={iconName} {color} {height} {width} />

  <slot />
</a>
