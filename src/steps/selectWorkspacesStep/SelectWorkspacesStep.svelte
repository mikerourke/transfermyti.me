<script lang="ts">
  import { onMount, tick } from "svelte";

  import { fetchAllFetchStatusUpdated } from "~/modules/allEntities/allEntitiesActions";
  import {
    targetToolDisplayNameSelector,
    toolActionSelector,
  } from "~/modules/allEntities/allEntitiesSelectors";
  import {
    navigateToWorkflowStep,
    WorkflowStep,
  } from "~/modules/app/workflowStep";
  import * as workspacesActions from "~/modules/workspaces/workspacesActions";
  import * as workspacesSelectors from "~/modules/workspaces/workspacesSelectors";
  import { dispatchAction, selectorToStore } from "~/redux/reduxToStore";
  import { FetchStatus, ToolAction, type Workspace } from "~/typeDefs";

  import HelpDetails from "~/components/HelpDetails.svelte";
  import Loader from "~/components/Loader.svelte";
  import NavigationButtonsRow from "~/components/NavigationButtonsRow.svelte";

  import DuplicateTargetsDialog from "./DuplicateTargetsDialog.svelte";
  import MissingWorkspacesDialog from "./MissingWorkspacesDialog.svelte";
  import NoWorkspacesDialog from "./NoWorkspacesDialog.svelte";
  import WorkspaceCard from "./WorkspaceCard.svelte";

  const areWorkspacesFetching = selectorToStore(
    workspacesSelectors.areWorkspacesFetchingSelector,
  );

  const firstIncludedWorkspaceId = selectorToStore(
    workspacesSelectors.firstIncludedWorkspaceIdSelector,
  );

  const hasDuplicateTargetWorkspaces = selectorToStore(
    workspacesSelectors.hasDuplicateTargetWorkspacesSelector,
  );

  const includedWorkspacesCount = selectorToStore(
    workspacesSelectors.sourceIncludedWorkspacesCountSelector,
  );

  const missingTargetWorkspaces = selectorToStore(
    workspacesSelectors.missingTargetWorkspacesSelector,
  );

  const sourceWorkspaces = selectorToStore(
    workspacesSelectors.sourceWorkspacesSelector,
  );

  const targetToolDisplayName = selectorToStore(targetToolDisplayNameSelector);

  const targetWorkspaces = selectorToStore(
    workspacesSelectors.targetWorkspacesSelector,
  );

  const toolAction = selectorToStore(toolActionSelector);

  let isNoWorkspacesDialogOpen: boolean = false;
  let isMissingWorkspacesDialogOpen: boolean = false;
  let isDuplicateTargetsDialogOpen: boolean = false;

  onMount(() => {
    if ($sourceWorkspaces.length === 0) {
      dispatchAction(workspacesActions.fetchWorkspaces.request());
    }
  });

  function handleSelectTargetForSource(
    event: CustomEvent<{
      sourceWorkspace: Workspace;
      targetWorkspace: Workspace;
    }>,
  ): void {
    const { sourceWorkspace, targetWorkspace } = event.detail;

    dispatchAction(
      workspacesActions.workspaceLinkingUpdated({
        sourceId: sourceWorkspace.id,
        targetId: targetWorkspace?.id || null,
      }),
    );
  }

  function handleToggleForSource(event: CustomEvent<Workspace>): void {
    dispatchAction(workspacesActions.isWorkspaceIncludedToggled(event.detail));
  }

  function handleBackClick(): void {
    navigateToWorkflowStep(WorkflowStep.EnterApiKeys);
  }

  async function handleNextClick(): Promise<void> {
    if (
      $missingTargetWorkspaces.length !== 0 &&
      $toolAction === ToolAction.Transfer
    ) {
      isMissingWorkspacesDialogOpen = true;

      return;
    }

    if ($includedWorkspacesCount === 0) {
      isNoWorkspacesDialogOpen = true;

      return;
    }

    if ($hasDuplicateTargetWorkspaces) {
      isDuplicateTargetsDialogOpen = true;

      return;
    }

    // prettier-ignore
    dispatchAction(workspacesActions.activeWorkspaceIdUpdated($firstIncludedWorkspaceId));

    dispatchAction(fetchAllFetchStatusUpdated(FetchStatus.Pending));

    await tick();

    navigateToWorkflowStep(WorkflowStep.SelectInclusions);
  }

  function handleRefreshClick(): void {
    dispatchAction(workspacesActions.fetchWorkspaces.request());
  }
</script>

<style>
  div {
    display: flex;
    flex-wrap: wrap;
  }
</style>

<main data-step={WorkflowStep.SelectWorkspaces}>
  <h1>Step 3: Select Workspaces</h1>

  <HelpDetails>
    <p>
      Toggle which workspaces you would like to include in the deletion/transfer
      and press the <strong>Next</strong> button to move on to the inclusions selection
      step.
    </p>

    {#if $toolAction === ToolAction.Transfer}
      <p>
        Once a workspace is toggled, you must select a target workspace for
        transfer (if workspaces exist on the target tool) from the
        <strong> Target Workspace</strong> dropdown. If you&apos;re transferring
        to Toggl, you must create the workspaces first.
      </p>
    {/if}

    <p>
      If you decide you want to include additional workspaces, you&apos;ll need
      to come back to this page and select them, otherwise the corresponding
      data won&apos;t be fetched.
    </p>

    <p class="note">
      Only select the workspaces containing data you wish to update. The fetch
      process can take several minutes depending on the amount of data in each
      workspace.
    </p>
  </HelpDetails>

  {#if $areWorkspacesFetching}
    <Loader>Loading workspaces, please wait...</Loader>
  {:else}
    <div>
      {#each $sourceWorkspaces as sourceWorkspace}
        <WorkspaceCard
          {sourceWorkspace}
          targetWorkspaces={$targetWorkspaces}
          toolAction={$toolAction}
          on:select-target={handleSelectTargetForSource}
          on:toggle={handleToggleForSource}
        />
      {/each}
    </div>
  {/if}

  <NavigationButtonsRow
    disabled={$areWorkspacesFetching}
    style="margin-top: 0;"
    refreshLabel="Refresh"
    on:back={handleBackClick}
    on:next={handleNextClick}
    on:refresh={handleRefreshClick}
  />

  <NoWorkspacesDialog bind:open={isNoWorkspacesDialogOpen} />

  <MissingWorkspacesDialog
    bind:open={isMissingWorkspacesDialogOpen}
    targetToolDisplayName={$targetToolDisplayName}
    workspaces={$missingTargetWorkspaces}
  />

  <DuplicateTargetsDialog bind:open={isDuplicateTargetsDialogOpen} />
</main>
