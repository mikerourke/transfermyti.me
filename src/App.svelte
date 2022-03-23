<script lang="ts">
  import {
    WorkflowStep,
    currentWorkflowStep,
  } from "~/modules/app/workflowStep";

  import Footer from "~/layout/Footer.svelte";
  import Header from "~/layout/Header.svelte";
  import Notifications from "~/layout/Notifications.svelte";
  import EnterApiKeysStep from "~/steps/enterApiKeysStep/EnterApiKeysStep.svelte";
  import PickToolActionStep from "~/steps/pickToolActionStep/PickToolActionStep.svelte";
  import SelectInclusionsStep from "~/steps/selectInclusionsStep/SelectInclusionsStep.svelte";
  import SelectWorkspacesStep from "~/steps/selectWorkspacesStep/SelectWorkspacesStep.svelte";
</script>

<Notifications />

<Header />

{#if $currentWorkflowStep === WorkflowStep.PickToolAction}
  <PickToolActionStep />
{:else if $currentWorkflowStep === WorkflowStep.EnterApiKeys}
  <EnterApiKeysStep />
{:else if $currentWorkflowStep === WorkflowStep.SelectWorkspaces}
  <SelectWorkspacesStep />
{:else if $currentWorkflowStep === WorkflowStep.SelectInclusions}
  <SelectInclusionsStep />
{:else if $currentWorkflowStep === WorkflowStep.PerformToolAction}
  <div>Yo</div>
{:else if $currentWorkflowStep === WorkflowStep.ToolActionSuccess}
  <div>Yo</div>
{:else}
  <div>Unknown Page!</div>
{/if}

<Footer />
