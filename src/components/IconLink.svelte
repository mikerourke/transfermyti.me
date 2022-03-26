<!--suppress TypeScriptCheckImport -->
<script lang="ts">
  import { css } from "goober";

  import Icon, { type IconName } from "~/components/Icon.svelte";

  export let href: string;
  export let iconName: IconName;
  export let color: string = "var(--color-white)";
  export let height: number | undefined = 24;
  export let width: number | undefined = 24;

  const styleClass = css`
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
    padding: 0;

    path {
      transition: fill 250ms linear;
    }

    &:hover {
      path {
        fill: var(--color-honeydew);
      }
    }
  `;
</script>

<a {href} class={styleClass} {...$$restProps}>
  <Icon name={iconName} {color} {height} {width} />

  <slot />
</a>
