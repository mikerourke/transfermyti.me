<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import Button from "~/components/Button.svelte";

  export let id: string;
  export let canToggleAll: boolean;

  const dispatchEvent = createEventDispatcher();

  function handleClick(): void {
    dispatchEvent("toggle-all");
  }
</script>

<div {id}>
  <h4><slot /></h4>

  <Button
    disabled={!canToggleAll}
    variant="outline"
    style="padding: 0.25rem 0.5rem; font-size: 0.875rem; border-radius: 0.25rem; font-weight: var(--font-weight-bold);"
    on:click={handleClick}
  >
    Include All/None
  </Button>
</div>
