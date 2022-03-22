<script lang="ts">
  import { ToolAction } from "~/typeDefs";

  import AlertDialog from "~/components/AlertDialog.svelte";
  import ExternalLink from "~/components/ExternalLink.svelte";

  export let open: boolean;
  export let toolAction: ToolAction;
</script>

<style>
  a {
    text-decoration: underline;
  }
</style>

{#if open}
  <AlertDialog on:close={() => (open = false)}>
    <h2>Error</h2>

    <p>You haven&apos;t selected any records to {toolAction}.</p>
    <p>
      Please ensure you have checked the checkbox next to the records you&apos;d
      like to include before proceeding.
    </p>

    {#if toolAction === ToolAction.Delete}
      <!-- prettier-ignore -->
      <p>
        Alternatively, all of the records may already exist on the target tool.
        If you believe this is an error, please <ExternalLink variant="dark" href="https://github.com/mikerourke/transfermyti.me/issues">file a GitHub issue </ExternalLink>
        or <a href="mailto:mike.w.rourke@gmail.com"> contact the developer</a>.
      </p>
    {/if}
  </AlertDialog>
{/if}
