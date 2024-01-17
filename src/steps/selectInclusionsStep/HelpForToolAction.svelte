<script lang="ts">
  import { ToolAction } from "~/types";

  import HelpDetails from "~/components/HelpDetails.svelte";

  export let toolAction: ToolAction;
</script>

<style>
  span {
    margin-left: 0.375rem;
  }
</style>

<!-- prettier-ignore -->
<HelpDetails>
  {#if toolAction === ToolAction.Delete}
    <p>
      Review the records you&apos;d like to delete. Change the active workspace
      by selecting it from the <strong>Active Workspace</strong> dropdown.
    </p>

    <p>
      Pressing the <strong>Include All/None</strong> button in the header above each
      table will select or deselect all of the corresponding records to be deleted.
      The footer in each table contains the totals associated with the corresponding
      column.
    </p>

    <p>
      Press the <strong>Next</strong> button when you&apos;re ready to delete
      the records you selected.

      <span class="note">
        The deletion process will not start until you confirm it on the next
        page.
      </span>
    </p>
  {:else if toolAction === ToolAction.Transfer}
    <p>
      Review the records you&apos;d like to include in the transfer. If the
      record already exists on the target tool, the option to include it is
      disabled.
    </p>

    <p>
      Change the active workspace by selecting it from the
      <strong> Active Workspace</strong> dropdown. Toggling
      <strong> Show records that already exist in target? </strong>
      will either show or hide the records that already exist in the target tool.
      This is useful if you only wish to see the records that
      <i> can</i> be transferred to the target tool.
    </p>

    <p>
      Pressing the <strong>Include All/None</strong> button in the header above each
      table will select or deselect all of the corresponding records to be included
      in the transfer. If all of the records in the group already exist, the button
      will be disabled. The footer in each table contains the totals associated with
      the corresponding column.
    </p>

    <p>
      Press the <strong>Next</strong> button when you&apos;re ready to begin the
      transfer.

      <span class="note">
        The transfer will not start until you confirm it on the next page.
      </span>
    </p>
  {:else}
    <p>Invalid action!</p>
  {/if}
</HelpDetails>
