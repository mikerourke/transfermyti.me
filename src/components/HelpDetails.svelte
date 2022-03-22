<script lang="ts">
  import { css } from "goober";

  export let title: string = "Show/Hide Help";
  export let open: boolean = true;

  const styleClass = css`
    p {
      &:first-of-type {
        margin-top: 0;
        padding-top: 0;
      }

      &:not(:first-of-type) {
        margin-top: 0;
      }

      &:last-of-type {
        margin-bottom: 0;
      }
    }
  `;
</script>

<style>
  details {
    width: 100%;
    margin-bottom: 1rem;
    color: var(--color-primary);
  }

  div,
  summary {
    margin: 0;
    padding: 0.5rem 0.25rem;
  }

  div {
    margin: 0 1rem;
  }

  summary {
    cursor: default;
    font-weight: var(--font-weight-bold);
  }
</style>

<details class={styleClass} {open} {...$$restProps}>
  <summary>
    {title}
  </summary>

  <div>
    <slot />
  </div>

  <hr />
</details>
