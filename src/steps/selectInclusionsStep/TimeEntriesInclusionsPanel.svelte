<script lang="ts">
  import { replaceMappingWithToolName } from "~/entityOperations/replaceMappingWithToolName";
  import { toolActionSelector } from "~/modules/allEntities/allEntitiesSelectors";
  import {
    flipIsTimeEntryIncluded,
    updateAreAllTimeEntriesIncluded,
    flipIsDuplicateCheckEnabled,
  } from "~/modules/timeEntries/timeEntriesActions";
  import {
    isDuplicateCheckEnabledSelector,
    timeEntriesForInclusionsTableSelector,
    timeEntriesTotalCountsByTypeSelector,
  } from "~/modules/timeEntries/timeEntriesSelectors";
  import { dispatchAction, selectorToStore } from "~/redux/reduxToStore";
  import { type TimeEntryTableViewModel, ToolAction } from "~/typeDefs";

  import AccordionPanel from "~/components/AccordionPanel.svelte";
  import InclusionsTableTitle from "~/components/InclusionsTableTitle.svelte";
  import NoRecordsFound from "~/components/NoRecordsFound.svelte";
  import Toggle from "~/components/Toggle.svelte";

  import TimeEntriesInclusionsTable from "./TimeEntriesInclusionsTable.svelte";
  import TimeEntryComparisonDisclaimer from "./TimeEntryComparisonDisclaimer.svelte";

  const isCheckDuplicates = selectorToStore(isDuplicateCheckEnabledSelector);

  const timeEntries = selectorToStore(timeEntriesForInclusionsTableSelector);

  const toolAction = selectorToStore(toolActionSelector);

  const totalCountsByType = selectorToStore(
    timeEntriesTotalCountsByTypeSelector,
  );

  let recordCount: number;
  $: recordCount = $timeEntries.length !== 0 ? $timeEntries.length : 1;

  let areAllToggled: boolean;
  $: areAllToggled =
    $totalCountsByType.isIncluded + $totalCountsByType.existsInTarget ===
    recordCount;

  let nonExistingRecords: TimeEntryTableViewModel[];
  $: nonExistingRecords = $timeEntries.filter(
    ({ existsInTarget }) => !existsInTarget,
  );

  function handleToggleAll(): void {
    dispatchAction(updateAreAllTimeEntriesIncluded(!areAllToggled));
  }

  function handleToggleOne(event: CustomEvent<string>): void {
    dispatchAction(flipIsTimeEntryIncluded(event.detail));
  }

  function handleToggleUseDuplicate(): void {
    dispatchAction(flipIsDuplicateCheckEnabled());
  }
</script>

<style>
  label {
    margin-bottom: 0.75rem;
    font-weight: var(--font-weight-bold);
  }
</style>

<AccordionPanel rowNumber={5} title="Time Entries">
  {#if recordCount === 0}
    <NoRecordsFound />
  {:else}
    {#if $toolAction === ToolAction.Transfer}
      <TimeEntryComparisonDisclaimer />

      <div style="margin-bottom: 0.75rem;">
        <label for="use-duplicate-check-toggle"
          >Use the time entry duplication check?</label
        >

        <Toggle
          id="use-duplicate-check-toggle"
          style="background-color: var(--color-white);"
          toggled={$isCheckDuplicates}
          on:toggle={handleToggleUseDuplicate}
        />
      </div>
    {/if}

    <InclusionsTableTitle
      id="time-entries-title"
      canToggleAll={nonExistingRecords.length !== 0}
      on:toggle-all={handleToggleAll}
    >
      {replaceMappingWithToolName("Time Entry Records in Source")}
    </InclusionsTableTitle>

    <TimeEntriesInclusionsTable
      timeEntries={$timeEntries}
      totalIncludedCount={$totalCountsByType.isIncluded}
      on:toggle={handleToggleOne}
    />
  {/if}
</AccordionPanel>
