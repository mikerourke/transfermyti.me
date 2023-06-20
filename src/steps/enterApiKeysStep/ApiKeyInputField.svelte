<script lang="ts">
  import { slide } from "svelte/transition";

  import type { ToolHelpDetails } from "~/types";

  import ExternalLink from "~/components/ExternalLink.svelte";

  export let mapping: string;
  export let toolHelpDetails: ToolHelpDetails;
  export let errorMessage: string | null;
  export let value: string;

  const { toolName, displayName, toolLink } = toolHelpDetails;
</script>

<style>
  input {
    margin-bottom: 2rem;
    padding: 0.5rem;
    width: 100%;
    border: none;
    border-radius: 0.25rem;
    font-family: monospace;
    font-size: 1.25rem;
    box-shadow: var(--elevation-dp2);
  }

  label {
    display: block;
    margin: 0.5rem 0;
    font-size: 1rem;
    font-weight: var(--font-weight-bold);
  }

  [role="alert"] {
    display: block;
    margin-top: -1.5rem;
    color: var(--color-ruby);
    font-weight: var(--font-weight-bold);
  }
</style>

<div>
  <!-- prettier-ignore -->
  <label for={toolName}>
    {displayName} API Key (<ExternalLink href={toolLink} color="var(--color-navy)">find it on your {displayName} profile page</ExternalLink>)
  </label>

  <input
    id={toolName}
    name={mapping}
    type="text"
    autocomplete="off"
    aria-describedby="{toolName}-error"
    aria-required={true}
    aria-invalid={errorMessage !== null}
    bind:value
  />

  {#if errorMessage !== null}
    <span transition:slide={{ duration: 250 }} role="alert">
      {errorMessage}
    </span>
  {/if}
</div>
