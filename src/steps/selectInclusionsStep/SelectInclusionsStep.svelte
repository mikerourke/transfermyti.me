<script lang="ts">
  import { css } from "goober";
  import { onMount } from "svelte";

  import {
    fetchAllEntities,
    flipIfExistsInTargetShown,
  } from "~/modules/allEntities/allEntitiesActions";
  import * as allEntitiesSelectors from "~/modules/allEntities/allEntitiesSelectors";
  import {
    navigateToWorkflowStep,
    WorkflowStep,
  } from "~/modules/app/workflowStep";
  import { updateActiveWorkspaceId } from "~/modules/workspaces/workspacesActions";
  import {
    activeWorkspaceIdSelector,
    includedSourceWorkspacesSelector,
  } from "~/modules/workspaces/workspacesSelectors";
  import { dispatchAction, selectorToStore } from "~/redux/reduxToStore";
  import { FetchStatus, ToolAction, type WorkspaceModel } from "~/typeDefs";
  import { capitalize } from "~/utilities/textTransforms";

  import Loader from "~/components/Loader.svelte";
  import NavigationButtonsRow from "~/components/NavigationButtonsRow.svelte";
  import Toggle from "~/components/Toggle.svelte";
  import WorkspaceSelect from "~/components/WorkspaceSelect.svelte";

  import ClientsInclusionsPanel from "./ClientsInclusionsPanel.svelte";
  import HelpForToolAction from "./HelpForToolAction.svelte";
  import NoSelectionsDialog from "./NoSelectionsDialog.svelte";
  import ProjectsInclusionsPanel from "./ProjectsInclusionsPanel.svelte";
  import TagsInclusionsPanel from "./TagsInclusionsPanel.svelte";
  import TasksInclusionsPanel from "./TasksInclusionsPanel.svelte";
  import TimeEntriesInclusionsPanel from "./TimeEntriesInclusionsPanel.svelte";

  const activeWorkspaceId = selectorToStore(activeWorkspaceIdSelector);

  const includedSourceWorkspaces = selectorToStore(
    includedSourceWorkspacesSelector,
  );

  const areExistsInTargetShown = selectorToStore(
    allEntitiesSelectors.areExistsInTargetShownSelector,
  );

  const entityGroupInProcessDisplay = selectorToStore(
    allEntitiesSelectors.entityGroupInProcessDisplaySelector,
  );

  const fetchAllFetchStatus = selectorToStore(
    allEntitiesSelectors.fetchAllFetchStatusSelector,
  );

  const toolAction = selectorToStore(allEntitiesSelectors.toolActionSelector);

  const totalIncludedRecordsCount = selectorToStore(
    allEntitiesSelectors.totalIncludedRecordsCountSelector,
  );

  let isNoSelectionsDialogOpen: boolean = false;

  onMount(() => {
    if ($fetchAllFetchStatus === FetchStatus.Pending) {
      dispatchAction(fetchAllEntities.request());
    }

    if (!$areExistsInTargetShown) {
      dispatchAction(flipIfExistsInTargetShown());
    }

    // I have no idea why I have to do this, but for some reason the "Select
    // Workspaces" component sticks around after navigating to this step:
    try {
      document
        .querySelector(`[data-step=${WorkflowStep.SelectWorkspaces}]`)
        ?.remove();
    } catch {
      // Do nothing.
    }
  });

  function handleSelectActiveWorkspace(
    event: CustomEvent<WorkspaceModel>,
  ): void {
    dispatchAction(updateActiveWorkspaceId(event.detail.id));
  }

  function handleShowExistingToggle(): void {
    dispatchAction(flipIfExistsInTargetShown());
  }

  function handleBackClick(): void {
    navigateToWorkflowStep(WorkflowStep.SelectWorkspaces);
  }

  function handleNextClick(): void {
    if ($totalIncludedRecordsCount === 0) {
      isNoSelectionsDialogOpen = true;
    } else {
      navigateToWorkflowStep(WorkflowStep.PerformToolAction);
    }
  }

  function handleRefreshClick(): void {
    dispatchAction(fetchAllEntities.request());
  }

  const workspacesFieldStyleClass = css`
    display: inline-block;
    margin-bottom: 1rem;
    position: relative;
    width: 100%;

    label {
      font-size: 1rem;
      font-weight: var(--font-weight-bold);
    }

    &:hover,
    &:focus {
      select {
        color: var(--color-primary);
      }

      span {
        border-top-color: var(--color-primary);
      }
    }
  `;
</script>

<main data-step={WorkflowStep.SelectInclusions}>
  <h1>Step 4: Select Records to {capitalize($toolAction)}</h1>

  <HelpForToolAction toolAction={$toolAction} />

  {#if $fetchAllFetchStatus === FetchStatus.Success}
    <div class={workspacesFieldStyleClass}>
      <label for="active-workspace">Active Workspace</label>
      <WorkspaceSelect
        id="active-workspace"
        workspaces={$includedSourceWorkspaces}
        value={$activeWorkspaceId}
        on:select={handleSelectActiveWorkspace}
      />
    </div>

    {#if $toolAction === ToolAction.Transfer}
      <div class="toggleRow">
        <label for="show-existing-toggle">
          Show records that already exist in target?
        </label>
        <Toggle
          id="show-existing-toggle"
          style="background-color: var(--color-white);"
          toggled={$areExistsInTargetShown}
          on:toggle={handleShowExistingToggle}
        />
      </div>
    {/if}

    <h2>Workspace Records</h2>
    <div style="margin-bottom: 2rem;">
      <ClientsInclusionsPanel />
      <TagsInclusionsPanel />
      <ProjectsInclusionsPanel />
      <TasksInclusionsPanel />
      <TimeEntriesInclusionsPanel />
    </div>
  {:else}
    <Loader>Fetching {$entityGroupInProcessDisplay}, please wait...</Loader>
  {/if}

  <NavigationButtonsRow
    disabled={$fetchAllFetchStatus === FetchStatus.InProcess}
    refreshLabel="Refresh"
    on:back={handleBackClick}
    on:next={handleNextClick}
    on:refresh={handleRefreshClick}
  />

  <NoSelectionsDialog
    bind:open={isNoSelectionsDialogOpen}
    toolAction={$toolAction}
  />
</main>
