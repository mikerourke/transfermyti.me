<script lang="ts">
  import { omit } from "ramda";

  import { toolActionSelector } from "~/modules/allEntities/allEntitiesSelectors";
  import {
    areAllProjectsIncludedUpdated,
    isProjectIncludedToggled,
  } from "~/modules/projects/projectsActions";
  import {
    projectsForInclusionsTableSelector,
    projectsTotalCountsByTypeSelector,
  } from "~/modules/projects/projectsSelectors";
  import { dispatchAction, selectorToStore } from "~/redux/reduxToStore";
  import { EntityGroup, ToolAction } from "~/typeDefs";

  import EntityGroupInclusionsPanel from "~/components/EntityGroupInclusionsPanel.svelte";

  const projects = selectorToStore(projectsForInclusionsTableSelector);

  const toolAction = selectorToStore(toolActionSelector);

  const totalCountsByType = selectorToStore(projectsTotalCountsByTypeSelector);

  // Only show the `isActiveInTarget` field if you're performing a transfer.
  // If the user is just deleting records, there is no "target":
  const tableFields = [
    { label: "Name", field: "name" },
    { label: "Time Entry Count", field: "entryCount" },
    { label: "Active in Source?", field: "isActiveInSource" },
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
    dispatchAction(areAllProjectsIncludedUpdated(event.detail));
  }

  function handleToggleOne(event: CustomEvent<string>): void {
    dispatchAction(isProjectIncludedToggled(event.detail));
  }
</script>

<EntityGroupInclusionsPanel
  entityGroup={EntityGroup.Projects}
  rowNumber={3}
  tableRecords={$projects}
  {tableFields}
  totalCountsByType={totalCountsByTypeToUse}
  on:toggle-all={handleToggleAll}
  on:toggle-one={handleToggleOne}
/>
