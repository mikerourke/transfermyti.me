<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let id: string;
  export let canToggleAll: boolean;

  const dispatchEvent = createEventDispatcher();

  function handleClick(): void {
    dispatchEvent("toggle-all");
  }
</script>

<style>
  div {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  button {
    height: fit-content;
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
    border-radius: 0.25rem;
    font-weight: var(--font-weight-bold);
    background-color: var(--color-secondary);
    color: var(--color-primary);
    border: 3px solid var(--color-primary);
    transition: all 250ms linear;
  }

  button:active,
  button:focus {
    background-color: var(--color-active);
    color: var(--color-secondary);
    outline: 2px solid var(--color-secondary);
    transform: scale(1.05);
  }
</style>

<div {id}>
  <h4><slot /></h4>

  <button disabled={!canToggleAll} on:click={handleClick}>
    Include All/None
  </button>
</div>
