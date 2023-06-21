<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import type { ToolAction, ToolName } from "~/types";

  import Button from "~/components/Button.svelte";
  import Card from "~/components/Card.svelte";

  export let title: string;
  export let toolAction: ToolAction;
  export let sourceTool: ToolName;
  export let targetTool: ToolName;

  const dispatchEvent = createEventDispatcher();

  function handleClick(): void {
    dispatchEvent("select", { toolAction, sourceTool, targetTool });
  }
</script>

<style>
  p {
    margin: 0 0 2rem;
  }
</style>

<Card {title}>
  <p><slot /></p>

  <Button
    variant="secondary"
    style="margin-top: auto; width: fit-content;"
    on:click={handleClick}
  >
    Select
  </Button>
</Card>
