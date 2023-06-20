<script lang="ts">
  import type { ToolAction } from "~/types";

  import ConfirmationDialog from "~/components/ConfirmationDialog.svelte";

  export let open: boolean;
  export let toolAction: ToolAction;
</script>

{#if open}
  <ConfirmationDialog on:cancel={() => (open = false)} on:confirm>
    <h2>Confirmation</h2>

    <p>
      Pressing the <strong>Confirm</strong> button will {toolAction} the records
      you selected. Would you like to continue?
    </p>

    <p class="note">
      Note: This action cannot be undone and will probably take awhile.
    </p>
  </ConfirmationDialog>
{/if}
