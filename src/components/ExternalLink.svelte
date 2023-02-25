<script lang="ts">
  import { clsx } from "clsx";

  import Icon from "~/components/Icon.svelte";

  import classes from "./ExternalLink.module.css";

  export let href: string;
  export let color: string = "var(--color-white)";
  export let size: number = 12;

  const { class: className, ...props } = $$restProps;
</script>

<a
  {href}
  rel="noopener noreferrer"
  target="_blank"
  class={clsx(classes.externalLink, className)}
  {...props}
>
  <slot />

  <Icon name="openExternal" {color} height={size} width={size} />
</a>
