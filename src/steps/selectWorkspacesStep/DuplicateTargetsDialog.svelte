<script lang="ts">
  import AlertDialog from "~/components/AlertDialog.svelte";

  export let open: boolean;
</script>

{#if open}
  <AlertDialog on:close={() => (open = false)}>
    <h2>Error</h2>

    <!-- prettier-ignore -->
    <p>
      You cannot select the same target workspace for two different source
      workspaces. Please either select a different target workspace or
      <strong> None</strong> from the <strong>Target Workspace </strong>
      dropdown.
    </p>
  </AlertDialog>
{/if}
