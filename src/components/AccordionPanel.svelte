<script lang="ts">
  import Icon from "~/components/Icon.svelte";

  import classes from "./AccordionPanel.module.css";

  export let rowNumber: number;
  export let title: string;
  export let expanded: boolean = false;

  function handleClick(): void {
    expanded = !expanded;
  }
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
    margin-bottom: 2rem;
    padding: 0 1rem;
  }
</style>

<div>
  <h3>
    <button
      id="accordion-title-{rowNumber}"
      aria-controls="accordion-content-{rowNumber}"
      aria-expanded={expanded}
      class={classes.iconButton}
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

  {#if expanded}
    <div
      id="accordion-content-{rowNumber}"
      role="region"
      aria-labelledby="accordion-title-{rowNumber}"
      aria-hidden={!expanded}
    >
      <slot />
    </div>
  {/if}
</div>
