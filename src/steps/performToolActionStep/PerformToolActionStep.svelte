<script lang="ts">
  import { onMount } from "svelte";
  import { slide } from "svelte/transition";

  import {
    createAllEntities,
    deleteAllEntities,
    transferCountsByEntityGroupReset,
  } from "~/redux/allEntities/allEntitiesActions";
  import {
    includedCountsByEntityGroupSelector,
    pushAllChangesFetchStatusSelector,
    toolActionSelector,
    transferCountsByEntityGroupSelector,
  } from "~/redux/allEntities/allEntitiesSelectors";
  import {
    navigateToWorkflowStep,
    WorkflowStep,
  } from "~/redux/app/workflowStep";
  import { dispatchAction, select } from "~/redux/reduxToStore";
  import {
    EntityGroup,
    FetchStatus,
    ToolAction,
    type CountsByEntityGroup,
  } from "~/types";
  import { capitalize } from "~/utilities/textTransforms";

  import HelpDetails from "~/components/HelpDetails.svelte";
  import NavigationButtonsRow from "~/components/NavigationButtonsRow.svelte";

  import ConfirmToolActionDialog from "./ConfirmToolActionDialog.svelte";
  import ProgressBar from "./ProgressBar.svelte";

  const pushAllChangesFetchStatus = select(pushAllChangesFetchStatusSelector);
  const toolAction = select(toolActionSelector);
  const includedCountsByEntityGroup = select<CountsByEntityGroup>(
    includedCountsByEntityGroupSelector,
  );
  const transferCountsByEntityGroup = select<any>(
    transferCountsByEntityGroupSelector,
  );

  const orderedEntityGroups: EntityGroup[] = getOrderedEntityGroups(
    $includedCountsByEntityGroup,
  );

  const totalCountsByGroup: any = { ...$includedCountsByEntityGroup };

  let isConfirmToolActionDialogOpen: boolean = false;

  const unsubscribe = pushAllChangesFetchStatus.subscribe((value) => {
    if (value === FetchStatus.Success) {
      navigateToWorkflowStep(WorkflowStep.ToolActionSuccess);
    }
  });

  onMount(() => {
    dispatchAction(transferCountsByEntityGroupReset());

    return () => {
      unsubscribe();
    };
  });

  function getOrderedEntityGroups(
    countsByEntityGroup: CountsByEntityGroup,
  ): EntityGroup[] {
    const entityGroups: EntityGroup[] = [];

    const allOrdered =
      $toolAction === ToolAction.Delete
        ? [
            EntityGroup.TimeEntries,
            EntityGroup.Tasks,
            EntityGroup.Projects,
            EntityGroup.Tags,
            EntityGroup.Clients,
          ]
        : Object.keys(countsByEntityGroup);

    for (const entityGroup of allOrdered) {
      // @ts-expect-error
      if (countsByEntityGroup[entityGroup] !== 0) {
        entityGroups.push(entityGroup as EntityGroup);
      }
    }

    return entityGroups;
  }

  function handleBackClick(): void {
    navigateToWorkflowStep(WorkflowStep.SelectInclusions);
  }

  const handleNextClick = (): void => {
    isConfirmToolActionDialogOpen = true;
  };

  function handleConfirmClick(): void {
    isConfirmToolActionDialogOpen = false;

    switch ($toolAction) {
      case ToolAction.Delete:
        dispatchAction(deleteAllEntities.request());
        break;

      case ToolAction.Transfer:
        dispatchAction(createAllEntities.request());
        break;

      default:
        break;
    }
  }
</script>

<style>
  ul {
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
  }

  li {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li:not(:last-of-type) {
    margin-bottom: 1.5rem;
  }
</style>

<main data-step={WorkflowStep.PerformToolAction}>
  <h1>
    {#if $toolAction === ToolAction.None}
      Step 5: Perform Action
    {:else}
      Step 5: Perform {capitalize($toolAction)} Action
    {/if}
  </h1>

  <HelpDetails>
    <!-- prettier-ignore -->
    <p>
      Press the <strong>Start</strong> button and confirm the action in the dialog.
    </p>

    <p class="note">
      Note: This could take several minutes due to API rate limiting.
    </p>
  </HelpDetails>

  <ul>
    {#each orderedEntityGroups as entityGroup}
      <li transition:slide|local={{ duration: 250 }}>
        <ProgressBar
          {entityGroup}
          completedCount={$transferCountsByEntityGroup[entityGroup]}
          totalCount={totalCountsByGroup[entityGroup]}
        />
      </li>
    {/each}
  </ul>

  <NavigationButtonsRow
    disabled={$pushAllChangesFetchStatus === FetchStatus.InProcess}
    nextLabel="Start"
    style="margin-top: 2rem;"
    on:back={handleBackClick}
    on:next={handleNextClick}
  />

  <ConfirmToolActionDialog
    bind:open={isConfirmToolActionDialogOpen}
    toolAction={$toolAction}
    on:confirm={handleConfirmClick}
  />
</main>
