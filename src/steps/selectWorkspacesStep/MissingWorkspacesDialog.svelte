<script lang="ts">
  import type { Workspace } from "~/types";

  import AlertDialog from "~/components/AlertDialog.svelte";

  export let open: boolean;
  export let targetToolDisplayName: string;
  export let workspaces: Workspace[];
</script>

<style>
  li {
    padding: 0.25rem 0;
    list-style: disc;
    font-weight: var(--font-weight-bold);
  }
</style>

{#if open}
  <AlertDialog on:close={() => (open = false)}>
    <h2>Error</h2>

    <p>
      The workspaces you selected don&apos;t exist in {targetToolDisplayName},
      and this tool is unable to create them.
    </p>

    <p>Please manually create the following workspaces before proceeding:</p>

    <ul>
      {#each workspaces as workspace}
        <li>{workspace.name}</li>
      {/each}
    </ul>
  </AlertDialog>
{/if}
