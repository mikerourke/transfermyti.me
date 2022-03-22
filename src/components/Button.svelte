<script lang="ts">
  import { createEventDispatcher } from "svelte";

  type Variant = "default" | "eggplant" | "outline" | "primary" | "secondary";

  export let variant: Variant = "default";
  export let disabled: boolean = false;
  export let loading: boolean = false;

  const dispatchEvent = createEventDispatcher();

  function handleClick(event: MouseEvent): void {
    if (loading) {
      // Do nothing.
    } else {
      dispatchEvent("click", event);
    }
  }
</script>

<style>
  button {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
    padding: 0.5rem 0.75rem;
    border-radius: 0.375rem;
    font-size: 1.25rem;
    font-weight: 400;
    border: none;
    box-shadow: var(--elevation-dp1);
    opacity: 1;
    transition: all 250ms linear;
  }

  button:disabled {
    opacity: 0.5;
  }

  button:active:not([aria-busy="true"]),
  button:focus:not([aria-busy="true"]) {
    background-color: var(--color-active);
    color: var(--color-secondary);
    outline: 2px solid var(--color-secondary);
    transform: scale(1.05);
    box-shadow: var(--elevation-dp8);
  }

  button:hover:not(:disabled) {
    text-decoration: underline;
  }

  span {
    position: relative;
    height: 1.5rem;
    width: 1.5rem;
    border-radius: 50%;
    transform: translateZ(0);
    animation: loading-spinner 1.4s infinite linear;
  }

  span::before {
    position: absolute;
    top: 0;
    left: 0;
    width: 50%;
    height: 50%;
    content: "";
    border-radius: 100% 0 0;
  }

  span::after {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    width: 75%;
    height: 75%;
    margin: auto;
    border-radius: 50%;
    content: "";
  }

  @keyframes loading-spinner {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }

  .default {
    background-color: var(--color-midnight);
    color: var(--color-secondary);
  }

  .default span {
    background: linear-gradient(
      to right,
      var(--color-secondary) 10%,
      var(--color-midnight) 40%
    );
  }

  .default span::before {
    background-color: var(--color-secondary);
  }

  .default span::after {
    background-color: var(--color-midnight);
  }

  .eggplant {
    background-color: var(--color-eggplant);
    color: var(--color-secondary);
  }

  .eggplant span {
    background: linear-gradient(
      to right,
      var(--color-secondary) 10%,
      var(--color-eggplant) 40%
    );
  }

  .eggplant span::before {
    background-color: var(--color-secondary);
  }

  .eggplant span::after {
    background-color: var(--color-eggplant);
  }

  .outline {
    background-color: var(--color-secondary);
    color: var(--color-primary);
    border: 3px solid var(--color-primary);
  }

  .outline span {
    background: linear-gradient(
      to right,
      var(--color-primary) 10%,
      var(--color-secondary) 40%
    );
  }

  .outline span::before {
    background-color: var(--color-primary);
  }

  .outline span::after {
    background-color: var(--color-secondary);
  }

  .primary {
    background-color: var(--color-primary);
    color: var(--color-secondary);
  }

  .primary span {
    background: linear-gradient(
      to right,
      var(--color-secondary) 10%,
      var(--color-primary) 40%
    );
  }

  .primary span::before {
    background-color: var(--color-secondary);
  }

  .primary span::after {
    background-color: var(--color-primary);
  }

  .secondary {
    background-color: var(--color-secondary);
    color: var(--color-primary);
  }

  .secondary span {
    background: linear-gradient(
      to right,
      var(--color-primary) 10%,
      var(--color-secondary) 40%
    );
  }

  .secondary span::before {
    background-color: var(--color-primary);
  }

  .secondary span::after {
    background-color: var(--color-secondary);
  }
</style>

<button
  {disabled}
  type="button"
  aria-busy={loading}
  on:click={handleClick}
  class:default={variant === "default"}
  class:eggplant={variant === "eggplant"}
  class:outline={variant === "outline"}
  class:primary={variant === "primary"}
  class:secondary={variant === "secondary"}
  {...$$restProps}
>
  {#if loading}
    <span />
  {:else}
    <slot />
  {/if}
</button>
