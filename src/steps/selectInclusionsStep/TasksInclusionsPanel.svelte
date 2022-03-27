<script lang="ts">
  import * as R from "ramda";

  import { toolActionSelector } from "~/modules/allEntities/allEntitiesSelectors";
  import {
    areAllTasksIncludedUpdated,
    isTaskIncludedToggled,
  } from "~/modules/tasks/tasksActions";
  import {
    tasksForInclusionsTableSelector,
    tasksTotalCountsByTypeSelector,
  } from "~/modules/tasks/tasksSelectors";
  import { dispatchAction, selectorToStore } from "~/redux/reduxToStore";
  import { EntityGroup, ToolAction } from "~/typeDefs";

  import EntityGroupInclusionsPanel from "~/components/EntityGroupInclusionsPanel.svelte";

  const tasks = selectorToStore(tasksForInclusionsTableSelector);

  const toolAction = selectorToStore(toolActionSelector);

  const totalCountsByType = selectorToStore(tasksTotalCountsByTypeSelector);

  // Only show the `isActiveInTarget` field if you're performing a transfer.
  // If the user is just deleting records, there is no "target":
  const tableFields = [
    { label: "Name", field: "name" },
    { label: "Project", field: "projectName" },
    { label: "Time Entry Count", field: "entryCount" },
    { label: "Active In Source?", field: "isActiveInSource" },
  ];

  if ($toolAction === ToolAction.Transfer) {
    tableFields.push({ label: "Active in Target?", field: "isActiveInTarget" });
  }

  // Only show the total for active in target if performing a transfer,
  // otherwise the columns will be off by 1:
  let totalCountsByTypeToUse: Dictionary<number>;
  $: totalCountsByTypeToUse =
    $toolAction === ToolAction.Transfer
      ? $totalCountsByType
      : R.omit(["isActiveInTarget"], $totalCountsByType);

  function handleToggleAll(event: CustomEvent<boolean>): void {
    dispatchAction(areAllTasksIncludedUpdated(event.detail));
  }

  function handleToggleOne(event: CustomEvent<string>): void {
    dispatchAction(isTaskIncludedToggled(event.detail));
  }
</script>

<EntityGroupInclusionsPanel
  entityGroup={EntityGroup.Tasks}
  rowNumber={4}
  tableRecords={$tasks}
  {tableFields}
  totalCountsByType={totalCountsByTypeToUse}
  on:toggle-all={handleToggleAll}
  on:toggle-one={handleToggleOne}
/>
