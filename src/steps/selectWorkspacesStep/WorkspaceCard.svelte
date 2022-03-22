<script lang="ts">
  import { css } from "goober";
  import * as R from "ramda";
  import { createEventDispatcher } from "svelte";
  import { slide } from "svelte/transition";

  import { ToolAction, WorkspaceModel } from "~/typeDefs";

  import Card from "~/components/Card.svelte";
  import Toggle from "~/components/Toggle.svelte";
  import WorkspaceSelect from "~/components/WorkspaceSelect.svelte";

  export let sourceWorkspace: WorkspaceModel;
  export let targetWorkspaces: WorkspaceModel[];
  export let toolAction: ToolAction;

  const dispatchEvent = createEventDispatcher();

  const targetWorkspace = targetWorkspaces.find(
    ({ id }) => id === sourceWorkspace.linkedId,
  );

  const targetSelectValue = R.isNil(targetWorkspace) ? "" : targetWorkspace.id;

  const workspacesForSelect = [...targetWorkspaces];

  const matchingNameWorkspace = targetWorkspaces.find(
    ({ name }) => name.toLowerCase() === sourceWorkspace.name.toLowerCase(),
  );

  // Don't allow the user to pick the "Create New" option if a workspace with
  // a matching name exists on the target:
  if (!matchingNameWorkspace) {
    workspacesForSelect.unshift({
      id: "",
      name: "None (Create New)",
    } as WorkspaceModel);
  }

  const actionTitle =
    toolAction === ToolAction.Delete
      ? "Include in Deletion?"
      : "Include in Transfer?";

  function handleToggleIncludeWorkspace(): void {
    dispatchEvent("toggle", sourceWorkspace);

    if (matchingNameWorkspace && !sourceWorkspace.isIncluded) {
      dispatchEvent("select-target", {
        sourceWorkspace,
        targetWorkspace: matchingNameWorkspace,
      });
    }
  }

  function handleSelectWorkspace(event: CustomEvent<WorkspaceModel>): void {
    dispatchEvent("select-target", {
      sourceWorkspace,
      targetWorkspace: event.detail,
    });
  }

  const styleClass = css`
    h2 {
      margin: 0;
    }

    [role="switch"] {
      margin-bottom: 0.5rem;
      margin-top: 0.5rem;
      background-color: var(--color-secondary);

      &:focus {
        outline-color: var(--color-active);
      }
    }
  `;
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

<Card title={sourceWorkspace.name} class={styleClass}>
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
