<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let id: string | undefined = undefined;
  export let style: string | undefined = undefined;
  export let toggled: boolean;

  const dispatchEvent = createEventDispatcher();

  function handleClick(): void {
    toggled = !toggled;

    dispatchEvent("toggle");
  }
</script>

<style>
  button {
    position: relative;
    display: inline-block;
    height: 2rem;
    width: 4.5rem;
    overflow: hidden;
    border: none;
    border-radius: 2rem;
    box-shadow: var(--elevation-dp2);
    transition: background 0.1s ease-in-out;
  }

  span {
    position: absolute;
    top: 0.2rem;
    height: 1.6rem;
    width: 1.6rem;
    display: inline-block;
    border-radius: 50%;
    pointer-events: none;
    text-transform: uppercase;
    transition: all 250ms linear;
    box-shadow: var(--elevation-dp2);
    font-size: 1rem;
    font-weight: var(--font-weight-bold);
  }

  [aria-checked="true"] span {
    background-color: var(--color-primary);
    left: 2.75rem;
  }

  [aria-checked="false"] span {
    background-color: var(--color-silver);
    left: 0.225rem;
  }

  span::before,
  span::after {
    position: absolute;
    color: var(--color-primary);
    line-height: 1.7rem;
  }

  [aria-checked="true"] span::before {
    content: "YES";
    left: -2.25rem;
  }

  [aria-checked="false"] span::after {
    content: "NO";
    right: -2.1375rem;
  }
</style>

<button
  {id}
  aria-checked={toggled}
  role="switch"
  {style}
  on:click={handleClick}
>
  <span />
</button>
