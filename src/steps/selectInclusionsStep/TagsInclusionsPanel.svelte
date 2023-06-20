<script lang="ts">
  import { dispatchAction, select } from "~/redux/reduxToStore";
  import {
    areAllTagsIncludedUpdated,
    isTagIncludedToggled,
  } from "~/redux/tags/tags.actions";
  import {
    tagsForInclusionsTableSelector,
    tagsTotalCountsByTypeSelector,
  } from "~/redux/tags/tags.selectors";
  import { EntityGroup } from "~/types";

  import EntityGroupInclusionsPanel from "~/components/EntityGroupInclusionsPanel.svelte";

  const tags = select(tagsForInclusionsTableSelector);
  const totalCountsByType = select(tagsTotalCountsByTypeSelector);

  function handleToggleAll(event: CustomEvent<boolean>): void {
    dispatchAction(areAllTagsIncludedUpdated(event.detail));
  }

  function handleToggleOne(event: CustomEvent<string>): void {
    dispatchAction(isTagIncludedToggled(event.detail));
  }
</script>

<EntityGroupInclusionsPanel
  entityGroup={EntityGroup.Tags}
  rowNumber={2}
  tableRecords={$tags}
  tableFields={[
    { label: "Name", field: "name" },
    { label: "Time Entry Count", field: "entryCount" },
  ]}
  totalCountsByType={$totalCountsByType}
  on:toggle-all={handleToggleAll}
  on:toggle-one={handleToggleOne}
/>
