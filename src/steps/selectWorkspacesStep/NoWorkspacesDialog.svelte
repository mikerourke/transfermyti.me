<script lang="ts">
  import AlertDialog from "~/components/AlertDialog.svelte";

  export let open: boolean;
</script>

{#if open}
  <AlertDialog on:close={() => (open = false)}>
    <h2>Error</h2>

    <p>You haven&apos;t selected any workspaces to include in the transfer.</p>

    <!-- prettier-ignore -->
    <p>
      Please ensure the workspaces you&apos;d like to transfer are toggled to
      <strong> Yes</strong>.
    </p>
  </AlertDialog>
{/if}
