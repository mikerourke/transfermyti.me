<script lang="ts">
  import Icon from "~/components/Icon.svelte";

  import classes from "./ExternalLink.module.css";

  export let href: string;
  export let color: string = "var(--color-white)";
</script>

<a
  {href}
  rel="noopener noreferrer"
  target="_blank"
  class={classes.externalLink}
>
  <slot />

  <Icon name="openExternal" {color} height={12} width={12} />
</a>
