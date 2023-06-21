<script lang="ts">
  import {
    toolActionUpdated,
    toolNameByMappingUpdated,
  } from "~/redux/allEntities/allEntities.actions";
  import {
    navigateToWorkflowStep,
    WorkflowStep,
  } from "~/redux/app/workflowStep";
  import { dispatchAction } from "~/redux/reduxToStore";
  import { ToolAction, ToolName } from "~/types";

  import HelpDetails from "~/components/HelpDetails.svelte";

  import ToolActionCard from "./ToolActionCard.svelte";

  function handleCardSelect(
    event: CustomEvent<{
      toolAction: ToolAction;
      sourceTool: ToolName;
      targetTool: ToolName;
    }>,
  ): void {
    const { toolAction, sourceTool: source, targetTool: target } = event.detail;

    dispatchAction(toolActionUpdated(toolAction));

    dispatchAction(toolNameByMappingUpdated({ source, target }));

    navigateToWorkflowStep(WorkflowStep.EnterApiKeys);
  }
</script>

<style>
  div {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
  }
</style>

<main data-step={WorkflowStep.PickToolAction}>
  <h1>Step 1: Pick an Action</h1>

  <HelpDetails open={true}>
    <p>
      Welcome to <strong>transfermyti.me</strong>! This tool can be used to
      transfer your content between time tracking tools like Toggl and Clockify.
    </p>

    <p>
      Each page has a help section that contains additional information about
      the step associated with that page. You can expand or collapse the help
      section by clicking on <strong>Show/Hide Help</strong>.
    </p>

    <p>
      Press the <strong>Select</strong> button for the action you wish to perform
      and you&apos;ll be guided through the appropriate steps.
    </p>
  </HelpDetails>

  <div>
    <ToolActionCard
      title="Transfer from Toggl to Clockify"
      toolAction={ToolAction.Transfer}
      sourceTool={ToolName.Toggl}
      targetTool={ToolName.Clockify}
      on:select={handleCardSelect}
    >
      Transfer your entries from Toggl to Clockify.me.
    </ToolActionCard>

    <ToolActionCard
      title="Transfer from Clockify to Toggl"
      toolAction={ToolAction.Transfer}
      sourceTool={ToolName.Clockify}
      targetTool={ToolName.Toggl}
      on:select={handleCardSelect}
    >
      Transfer your entries from Clockify.me to Toggl.
    </ToolActionCard>

    <ToolActionCard
      title="Delete Clockify Records"
      toolAction={ToolAction.Delete}
      sourceTool={ToolName.Clockify}
      targetTool={ToolName.None}
      on:select={handleCardSelect}
    >
      Bulk delete content from your Clockify.me account.
    </ToolActionCard>

    <ToolActionCard
      title="Delete Toggl Records"
      toolAction={ToolAction.Delete}
      sourceTool={ToolName.Toggl}
      targetTool={ToolName.None}
      on:select={handleCardSelect}
    >
      Bulk delete content from your Toggl account.
    </ToolActionCard>
  </div>
</main>
