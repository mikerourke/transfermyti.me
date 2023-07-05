<script lang="ts">
  import { omit } from "ramda";

  import { toolActionSelector } from "~/redux/allEntities/allEntitiesSelectors";
  import { dispatchAction, select } from "~/redux/reduxToStore";
  import {
    areAllTasksIncludedUpdated,
    isTaskIncludedToggled,
  } from "~/redux/tasks/tasksActions";
  import {
    tasksForInclusionsTableSelector,
    tasksTotalCountsByTypeSelector,
  } from "~/redux/tasks/tasksSelectors";
  import { EntityGroup, ToolAction } from "~/types";

  import EntityGroupInclusionsPanel from "~/components/EntityGroupInclusionsPanel.svelte";

  const tasks = select(tasksForInclusionsTableSelector);
  const toolAction = select(toolActionSelector);
  const totalCountsByType = select(tasksTotalCountsByTypeSelector);

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
      : omit(["isActiveInTarget"], $totalCountsByType);

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
