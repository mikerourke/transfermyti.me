<script lang="ts">
  import {
    navigateToWorkflowStep,
    WorkflowStep,
  } from "~/modules/app/workflowStep";

  import Logo from "~/layout/Logo.svelte";

  function handleClick(): void {
    navigateToWorkflowStep(WorkflowStep.PickToolAction);
  }
</script>

<style>
  header {
    display: flex;
    align-items: center;
    height: var(--height-header);
    padding: 0 1rem;
    width: 100%;
    background-color: var(--color-primary);
    color: var(--color-secondary);
    box-shadow: var(--elevation-dp1);
  }

  button {
    appearance: none;
    margin: 0;
    padding: 0.25rem;
    background-color: transparent;
    color: var(--color-secondary);
    font-size: 1.5rem;
    box-shadow: none;
  }

  button:active,
  button:focus {
    outline: 2px solid var(--color-active);
  }

  button:hover {
    text-decoration: underline;
  }
</style>

<header>
  <Logo />

  <button on:click={handleClick}>transfermyti.me</button>
</header>
