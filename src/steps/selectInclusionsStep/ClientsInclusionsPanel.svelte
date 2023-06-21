<script lang="ts">
  import {
    areAllClientsIncludedUpdated,
    isClientIncludedToggled,
  } from "~/redux/clients/clients.actions";
  import {
    clientsForInclusionsTableSelector,
    clientsTotalCountsByTypeSelector,
  } from "~/redux/clients/clients.selectors";
  import { dispatchAction, select } from "~/redux/reduxToStore";
  import { EntityGroup } from "~/types";

  import EntityGroupInclusionsPanel from "~/components/EntityGroupInclusionsPanel.svelte";

  const clients = select(clientsForInclusionsTableSelector);
  const totalCountsByType = select(clientsTotalCountsByTypeSelector);

  function handleToggleAll(event: CustomEvent<boolean>): void {
    dispatchAction(areAllClientsIncludedUpdated(event.detail));
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
