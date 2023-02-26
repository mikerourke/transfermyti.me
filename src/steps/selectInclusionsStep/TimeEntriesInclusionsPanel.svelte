<script lang="ts">
  import { replaceMappingWithToolName } from "~/entityOperations/replaceMappingWithToolName";
  import { toolActionSelector } from "~/redux/allEntities/allEntitiesSelectors";
  import { dispatchAction, selectorToStore } from "~/redux/reduxToStore";
  import {
    areAllTimeEntriesIncludedUpdated,
    isDuplicateCheckEnabledToggled,
    isTimeEntryIncludedToggled,
  } from "~/redux/timeEntries/timeEntriesActions";
  import {
    isDuplicateCheckEnabledSelector,
    timeEntriesForInclusionsTableSelector,
    timeEntriesTotalCountsByTypeSelector,
  } from "~/redux/timeEntries/timeEntriesSelectors";
  import { ToolAction, type TimeEntryTableRecord } from "~/typeDefs";

  import AccordionPanel from "~/components/AccordionPanel.svelte";
  import InclusionsTableTitle from "~/components/InclusionsTableTitle.svelte";
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

  let nonExistingRecords: TimeEntryTableRecord[];
  $: nonExistingRecords = $timeEntries.filter(
    ({ existsInTarget }) => !existsInTarget,
  );

  let slideDuration: number;
  $: slideDuration = Math.min(750, recordCount * 25);

  function handleToggleAll(): void {
    dispatchAction(areAllTimeEntriesIncludedUpdated(!areAllToggled));
  }

  function handleToggleOne(event: CustomEvent<string>): void {
    dispatchAction(isTimeEntryIncludedToggled(event.detail));
  }

  function handleToggleUseDuplicate(): void {
    dispatchAction(isDuplicateCheckEnabledToggled());
  }
</script>

<AccordionPanel rowNumber={5} title="Time Entries" {slideDuration}>
  {#if recordCount === 0}
    <p class="no-records-found">No records found!</p>
  {:else}
    {#if $toolAction === ToolAction.Transfer}
      <TimeEntryComparisonDisclaimer />

      <div class="toggle-row" style="margin: 0.75rem 0;">
        <label for="use-duplicate-check-toggle">
          Use the time entry duplication check?
        </label>

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
