<script lang="ts">
  import { isNil } from "ramda";
  import { createEventDispatcher } from "svelte";
  import { slide } from "svelte/transition";

  import { ToolAction, type Workspace } from "~/typeDefs";

  import Card from "~/components/Card.svelte";
  import Toggle from "~/components/Toggle.svelte";
  import WorkspaceSelect from "~/components/WorkspaceSelect.svelte";

  import classes from "./WorkspaceCard.module.css";

  export let sourceWorkspace: Workspace;
  export let targetWorkspaces: Workspace[];
  export let toolAction: ToolAction;

  const dispatchEvent = createEventDispatcher();

  const targetWorkspace = targetWorkspaces.find(
    ({ id }) => id === sourceWorkspace.linkedId,
  );

  const targetSelectValue = isNil(targetWorkspace) ? "" : targetWorkspace.id;

  const workspacesForSelect = [...targetWorkspaces];

  const matchingNameWorkspace = targetWorkspaces.find(
    ({ name }) => name.toLowerCase() === sourceWorkspace.name.toLowerCase(),
  );

  // Don't allow the user to pick the "Create New" option if a workspace with
  // a matching name exists on the target:
  if (isNil(matchingNameWorkspace)) {
    workspacesForSelect.unshift({
      id: "",
      name: "None (Create New)",
    } as Workspace);
  }

  const actionTitle =
    toolAction === ToolAction.Delete
      ? "Include in Deletion?"
      : "Include in Transfer?";

  function handleToggleIncludeWorkspace(): void {
    dispatchEvent("toggle", sourceWorkspace);

    if (!isNil(matchingNameWorkspace) && !sourceWorkspace.isIncluded) {
      dispatchEvent("select-target", {
        sourceWorkspace,
        targetWorkspace: matchingNameWorkspace,
      });
    }
  }

  function handleSelectWorkspace(event: CustomEvent<Workspace>): void {
    dispatchEvent("select-target", {
      sourceWorkspace,
      targetWorkspace: event.detail,
    });
  }
</script>

<style>
  h3 {
    margin-bottom: 0.25rem;
    margin-top: 0.5rem;
  }

  hr {
    width: 100%;
  }
</style>

<Card title={sourceWorkspace.name} class={classes.workspaceCard}>
  <hr />

  <h3>{actionTitle}</h3>

  <Toggle
    aria-label={actionTitle}
    toggled={sourceWorkspace.isIncluded}
    on:toggle={handleToggleIncludeWorkspace}
  />

  {#if sourceWorkspace.isIncluded && targetWorkspaces.length !== 0}
    <div transition:slide={{ duration: 250 }}>
      <h3>Target Workspaces</h3>

      <WorkspaceSelect
        id="{sourceWorkspace.id}-select"
        style="background-color: var(--color-secondary); font-size: 1.125rem;"
        value={targetSelectValue}
        workspaces={workspacesForSelect}
        on:select={handleSelectWorkspace}
      />
    </div>
  {/if}
</Card>
