<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import type { BaseEntityModel, TableViewModel } from "~/typeDefs";
  import { booleanToYesNo } from "~/utilities/textTransforms";

  import InclusionsTableTitle from "~/components/InclusionsTableTitle.svelte";

  export let id: string;
  export let title: string;
  export let fieldNames: string[];
  export let fieldLabels: string[];
  export let tableRecords: TableViewModel<BaseEntityModel>[];
  export let totalCountsByType: Dictionary<number>;

  const dispatchEvent = createEventDispatcher();

  let canToggleAll: boolean;
  $: canToggleAll = tableRecords.some((record) => !record.existsInTarget);

  let totalCounts: number[];
  $: totalCounts = getTotalCounts(totalCountsByType);

  let fieldCount: number;
  $: fieldCount = fieldNames.length;

  function getTotalCounts(countsByType: Dictionary<number>): number[] {
    const { existsInTarget, ...validCountsByType } = countsByType;
    return Object.values(validCountsByType);
  }

  function handleIncludeButtonClick(): void {
    dispatchEvent("toggle-all");
  }

  function handleIncludeToggle(id: string): void {
    dispatchEvent("toggle-one", id);
  }
</script>

<InclusionsTableTitle
  id="{id}-title"
  {canToggleAll}
  on:toggle-all={handleIncludeButtonClick}
>
  {title}
</InclusionsTableTitle>

<table {id} role="grid" aria-labelledby="{id}-title">
  <thead>
    <tr>
      {#each fieldLabels as label}
        <th scope="col">{label}</th>
      {/each}

      <th data-include scope="col">Include?</th>
    </tr>
  </thead>

  <tbody>
    {#each tableRecords as record (record.id)}
      <tr data-disabled={record.existsInTarget}>
        {#each fieldNames as fieldName}
          <td>{booleanToYesNo(record[fieldName])}</td>
        {/each}

        <td data-include>
          <input
            type="checkbox"
            checked={record.existsInTarget ? false : record.isIncluded}
            disabled={record.existsInTarget}
            on:input={() => handleIncludeToggle(record.id)}
          />
        </td>
      </tr>
    {/each}
  </tbody>

  <tfoot>
    <tr>
      <th colspan={fieldCount + 1 - totalCounts.length}>
        {totalCounts.length === 1 ? "Total" : "Totals"}
      </th>

      {#each totalCounts as totalCount}
        <td>{totalCount}</td>
      {/each}
    </tr>
  </tfoot>
</table>
