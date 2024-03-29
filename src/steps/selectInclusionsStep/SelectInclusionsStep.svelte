<script lang="ts">
  import { onMount } from "svelte";

  import {
    fetchAllEntities,
    isExistsInTargetShownToggled,
  } from "~/redux/allEntities/allEntitiesActions";
  import {
    areExistsInTargetShownSelector,
    entityGroupInProcessDisplaySelector,
    fetchAllFetchStatusSelector,
    toolActionSelector,
    toolDisplayNameByMappingSelector,
    totalIncludedRecordsCountSelector,
  } from "~/redux/allEntities/allEntitiesSelectors";
  import {
    navigateToWorkflowStep,
    WorkflowStep,
  } from "~/redux/app/workflowStep";
  import { dispatchAction, select } from "~/redux/reduxToStore";
  import { FetchStatus, ToolAction } from "~/types";
  import { capitalize } from "~/utilities/textTransforms";

  import Loader from "~/components/Loader.svelte";
  import NavigationButtonsRow from "~/components/NavigationButtonsRow.svelte";
  import Toggle from "~/components/Toggle.svelte";

  import ActiveWorkspaceSelectField from "./ActiveWorkspaceSelectField.svelte";
  import ClientsInclusionsPanel from "./ClientsInclusionsPanel.svelte";
  import HelpForToolAction from "./HelpForToolAction.svelte";
  import NoSelectionsDialog from "./NoSelectionsDialog.svelte";
  import ProjectsInclusionsPanel from "./ProjectsInclusionsPanel.svelte";
  import TagsInclusionsPanel from "./TagsInclusionsPanel.svelte";
  import TasksInclusionsPanel from "./TasksInclusionsPanel.svelte";
  import TimeEntriesInclusionsPanel from "./TimeEntriesInclusionsPanel.svelte";

  const areExistsInTargetShown = select(areExistsInTargetShownSelector);
  const entityGroupDisplay = select(entityGroupInProcessDisplaySelector);
  const fetchAllFetchStatus = select(fetchAllFetchStatusSelector);
  const toolDisplayNameByMapping = select(toolDisplayNameByMappingSelector);
  const toolAction = select(toolActionSelector);
  const totalIncludedRecordsCount = select(totalIncludedRecordsCountSelector);

  let isNoSelectionsDialogOpen: boolean = false;

  onMount(() => {
    if ($fetchAllFetchStatus === FetchStatus.Pending) {
      dispatchAction(fetchAllEntities.request());
    }

    if (!$areExistsInTargetShown) {
      dispatchAction(isExistsInTargetShownToggled());
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

  function handleShowExistingToggle(): void {
    dispatchAction(isExistsInTargetShownToggled());
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

  function getHeader(): string {
    const displayToolAction = capitalize($toolAction);

    let suffix = "";

    if ($toolAction === ToolAction.Delete) {
      suffix = `from ${$toolDisplayNameByMapping.source}`;
    } else {
      suffix = `to ${$toolDisplayNameByMapping.target}`;
    }

    return `Step 4: Select Records to ${displayToolAction} ${suffix}`;
  }
</script>

<main data-step={WorkflowStep.SelectInclusions}>
  <h1>{getHeader()}</h1>

  <HelpForToolAction toolAction={$toolAction} />

  {#if $fetchAllFetchStatus === FetchStatus.Success}
    <ActiveWorkspaceSelectField />

    {#if $toolAction === ToolAction.Transfer}
      <div class="toggle-row">
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
    <Loader>Fetching {$entityGroupDisplay}, please wait...</Loader>
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
