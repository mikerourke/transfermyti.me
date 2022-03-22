<script lang="ts">
  import { css } from "goober";

  import Icon from "~/components/Icon.svelte";

  export let rowNumber: number;
  export let title: string;
  export let expanded: boolean = false;

  const titleId = `accordion-title-${rowNumber}`;
  const contentId = `accordion-content-${rowNumber}`;

  function handleClick(): void {
    expanded = !expanded;
  }

  const buttonStyleClass = css`
    &:hover {
      path {
        fill: var(--color-white);
      }
    }
  `;
</script>

<style>
  h3 {
    margin: 0;
  }

  button {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 1rem;
    padding: 0.75rem 1rem;
    appearance: none;
    border: none;
    font-size: 1.25rem;
    text-align: left;
    background-color: var(--color-white);
    border-radius: 0.375rem;
    box-shadow: var(--elevation-dp2);
    color: var(--color-primary);
  }

  button:hover {
    background-color: var(--color-primary);
    color: var(--color-white);
    text-decoration: underline;
  }

  [role="region"] {
    display: none;
    margin-bottom: 2rem;
    padding: 0 1rem;
  }

  [role="region"].expanded {
    display: block;
  }
</style>

<div>
  <h3>
    <button
      id={titleId}
      aria-controls={contentId}
      aria-expanded={expanded}
      class={buttonStyleClass}
      on:click={handleClick}
    >
      {title}

      <Icon
        color="var(--color-primary)"
        name={expanded ? "circleRemove" : "circleAdd"}
        height={32}
        width={32}
      />
    </button>
  </h3>

  <div
    id={contentId}
    aria-labelledby={titleId}
    role="region"
    aria-hidden={!expanded}
    class:expanded
  >
    <slot />
  </div>
</div>
