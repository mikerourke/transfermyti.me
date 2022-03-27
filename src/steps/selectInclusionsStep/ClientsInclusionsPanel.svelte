<script lang="ts">
  import {
    areAllClientsIncludedChanged,
    isClientIncludedToggled,
  } from "~/modules/clients/clientsActions";
  import {
    clientsForInclusionsTableSelector,
    clientsTotalCountsByTypeSelector,
  } from "~/modules/clients/clientsSelectors";
  import { dispatchAction, selectorToStore } from "~/redux/reduxToStore";
  import { EntityGroup } from "~/typeDefs";

  import EntityGroupInclusionsPanel from "~/components/EntityGroupInclusionsPanel.svelte";

  const clients = selectorToStore(clientsForInclusionsTableSelector);

  const totalCountsByType = selectorToStore(clientsTotalCountsByTypeSelector);

  function handleToggleAll(event: CustomEvent<boolean>): void {
    dispatchAction(areAllClientsIncludedChanged(event.detail));
  }

  function handleToggleOne(event: CustomEvent<string>): void {
    dispatchAction(isClientIncludedToggled(event.detail));
  }
</script>

<EntityGroupInclusionsPanel
  entityGroup={EntityGroup.Clients}
  rowNumber={1}
  tableRecords={$clients}
  tableFields={[
    { label: "Name", field: "name" },
    { label: "Time Entry Count", field: "entryCount" },
    { label: "Project Count", field: "projectCount" },
  ]}
  totalCountsByType={$totalCountsByType}
  on:toggle-all={handleToggleAll}
  on:toggle-one={handleToggleOne}
/>
