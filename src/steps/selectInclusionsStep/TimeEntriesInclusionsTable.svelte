<script lang="ts">
  import format from "date-fns/format";
  import { createEventDispatcher } from "svelte";

  import type { TimeEntryTableViewModel } from "~/typeDefs";

  export let timeEntries: TimeEntryTableViewModel[];
  export let totalIncludedCount: number;

  const dispatchEvent = createEventDispatcher();

  function handleIncludeToggle(id: string): void {
    dispatchEvent("toggle", id);
  }
</script>

<style>
  td[data-disabled="true"] {
    color: var(--color-manatee);
  }

  td[data-null="true"] {
    color: var(--color-manatee);
    font-style: italic;
  }
</style>

<table>
  <thead>
    <tr>
      <th scope="col">Start Time</th>
      <th scope="col">End Time</th>
      <th scope="col">Task</th>
      <th scope="col">Project</th>
      <th scope="col" rowSpan={2} data-include={true}> Include? </th>
    </tr>
    <tr>
      <th scope="col" colSpan={3}> Description </th>
      <th scope="col">Tags</th>
    </tr>
  </thead>

  <tbody>
    {#each timeEntries as timeEntry}
      <tr>
        <td>{format(timeEntry.start, "Pp")}</td>
        <td>{format(timeEntry.end, "Pp")}</td>
        <td
          data-null={timeEntry.taskName === null}
          data-disabled={timeEntry.existsInTarget}
        >
          {timeEntry.taskName ?? "None"}
        </td>
        <td
          data-null={timeEntry.projectName === null}
          data-disabled={timeEntry.existsInTarget}
        >
          {timeEntry.projectName ?? "None"}
        </td>

        <td data-include rowspan={2}>
          <input
            type="checkbox"
            checked={timeEntry.existsInTarget ? false : timeEntry.isIncluded}
            disabled={timeEntry.existsInTarget}
            on:input={() => handleIncludeToggle(timeEntry.id)}
          />
        </td>
      </tr>

      <tr data-disabled={timeEntry.existsInTarget}>
        <td colspan={3}>{timeEntry.description}</td>
        <td>{timeEntry.tagNames.join(", ")}</td>
      </tr>
    {/each}
  </tbody>

  <tfoot>
    <tr>
      <th colspan={4}> Total </th>
      <td>{totalIncludedCount}</td>
    </tr>
  </tfoot>
</table>
