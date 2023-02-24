<script lang="ts">
  import { clsx } from "clsx";
  import { css } from "goober";

  import Icon from "~/components/Icon.svelte";

  export let href: string;
  export let color: string = "var(--color-white)";
  export let size: number = 12;

  const { class: className, ...props } = $$restProps;

  const styleClass = css`
    svg {
      margin: 0 0.25rem;
    }
  `;
</script>

<a
  {href}
  rel="noopener noreferrer"
  target="_blank"
  class={clsx(styleClass, className)}
  {...props}
>
  <slot />

  <Icon name="openExternal" {color} height={size} width={size} />
</a>
