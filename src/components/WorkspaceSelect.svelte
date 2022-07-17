<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import type { Workspace } from "~/typeDefs";

  export let id: string;
  export let value: string;
  export let workspaces: Workspace[];

  const dispatchEvent = createEventDispatcher();

  function handleInput(event: SelectChangeEvent): void {
    const selected = event.currentTarget.value;

    value = selected;

    const workspace = workspaces.find(({ id }) => id === selected);

    dispatchEvent("select", workspace);
  }

  const options = workspaces.map(({ id, name }) => ({
    label: name,
    value: id,
  }));
</script>

<style>
  div {
    position: relative;
  }

  select {
    display: inline-block;
    width: 100%;
    margin-top: 0.5rem;
    padding: 0.75rem 1rem;
    appearance: none;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
    font-size: 1rem;
    background-color: var(--color-white);
    color: var(--color-primary);
    box-shadow: var(--elevation-dp2);
  }

  span {
    position: absolute;
    bottom: 1.125rem;
    right: 1.5rem;
    height: 0;
    width: 0;
    border-color: var(--color-midnight) transparent transparent;
    border-style: solid;
    border-width: 0.5rem 0.5rem 0;
    pointer-events: none;
  }
</style>

<div>
  <select {id} {value} on:input={handleInput} {...$$restProps}>
    {#each options as option}
      <option value={option.value}>{option.label}</option>
    {/each}
  </select>

  <span />
</div>
