<script lang="ts">
  import { compose, prop, sortBy, toLower } from "ramda";
  import { createEventDispatcher } from "svelte";

  import type { AnyEntity, EntityGroup, EntityTableRecord } from "~/types";
  import { replaceMappingWithToolName } from "~/utilities/replaceMappingWithToolName";
  import { getEntityGroupDisplay } from "~/utilities/textTransforms";

  import AccordionPanel from "~/components/AccordionPanel.svelte";
  import InclusionsTable from "~/components/InclusionsTable.svelte";

  type TableRecord = EntityTableRecord<AnyEntity>;

  type TableField = { label: string; field: string };

  export let entityGroup: EntityGroup;
  export let rowNumber: number;
  export let tableRecords: TableRecord[];
  export let tableFields: TableField[];
  export let totalCountsByType: Dictionary<number>;

  const dispatchEvent = createEventDispatcher();

  let fieldLabels: string[];
  $: fieldLabels = getFieldLabels(tableFields);

  let fieldNames: string[];
  $: fieldNames = getFieldNames(tableFields);

  let sortedRecords: TableRecord[];
  $: sortedRecords = sortTableRecords(tableRecords);

  let entityGroupDisplay: string;
  $: entityGroupDisplay = getEntityGroupDisplay(entityGroup);

  function getFieldLabels(fields: TableField[]): string[] {
    return fields.map((tableField) =>
      replaceMappingWithToolName(tableField.label),
    );
  }

  function getFieldNames(fields: TableField[]): string[] {
    return fields.map((tableField) => tableField.field);
  }

  function sortTableRecords(records: TableRecord[]): TableRecord[] {
    try {
      const sortByName = sortBy<AnyValid>(
        compose(toLower, prop<"name">("name")),
      );

      return sortByName(records);
    } catch {
      // Do nothing. If the data records don't have a `name` field, just pass the
      // original data into the table.
      return records;
    }
  }

  function handleToggleAllInclusions(): void {
    const { isIncluded, existsInTarget } = totalCountsByType;

    const areAllToggled = isIncluded + existsInTarget === tableRecords.length;

    dispatchEvent("toggle-all", !areAllToggled);
  }
</script>

<AccordionPanel {rowNumber} title={entityGroupDisplay}>
  {#if tableRecords.length === 0}
    <p class="no-records-found">No records found!</p>
  {:else}
    <!-- prettier-ignore -->
    <InclusionsTable
      id="{entityGroup}-inclusions"
      title={replaceMappingWithToolName(`${entityGroupDisplay} Records in Source`)}
      {fieldNames}
      {fieldLabels}
      tableRecords={sortedRecords}
      {totalCountsByType}
      on:toggle-all={handleToggleAllInclusions}
      on:toggle-one
    />
  {/if}
</AccordionPanel>
