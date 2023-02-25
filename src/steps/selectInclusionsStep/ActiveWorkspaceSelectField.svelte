<script lang="ts">
  import { dispatchAction, selectorToStore } from "~/redux/reduxToStore";
  import { activeWorkspaceIdUpdated } from "~/redux/workspaces/workspacesActions";
  import {
    activeWorkspaceIdSelector,
    includedSourceWorkspacesSelector,
  } from "~/redux/workspaces/workspacesSelectors";
  import type { Workspace } from "~/typeDefs";

  import WorkspaceSelect from "~/components/WorkspaceSelect.svelte";

  import classes from "./ActiveWorkspaceSelectField.module.css";

  const activeWorkspaceId = selectorToStore(activeWorkspaceIdSelector);

  const includedSourceWorkspaces = selectorToStore(
    includedSourceWorkspacesSelector,
  );

  function handleSelect(event: CustomEvent<Workspace>): void {
    dispatchAction(activeWorkspaceIdUpdated(event.detail.id));
  }
</script>

<style>
  div {
    display: inline-block;
    margin-bottom: 1rem;
    position: relative;
    width: 100%;
  }

  label {
    font-size: 1rem;
    font-weight: var(--font-weight-bold);
  }
</style>

<div class={classes.activeWorkspaceSelectField}>
  <label for="active-workspace">Active Workspace</label>

  <WorkspaceSelect
    id="active-workspace"
    workspaces={$includedSourceWorkspaces}
    value={$activeWorkspaceId}
    on:select={handleSelect}
  />
</div>
