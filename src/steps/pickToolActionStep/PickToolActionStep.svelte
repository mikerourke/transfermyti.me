<script lang="ts">
  import {
    updateToolAction,
    updateToolNameByMapping,
  } from "~/modules/allEntities/allEntitiesActions";
  import { navigateToRoute } from "~/modules/app/navigateToRoute";
  import { dispatchAction } from "~/redux/reduxToStore";
  import { RoutePath, ToolAction, ToolName } from "~/typeDefs";

  import HelpDetails from "~/components/HelpDetails.svelte";

  import ToolActionCard from "./ToolActionCard.svelte";

  function handleCardSelect(
    event: CustomEvent<{
      action: ToolAction;
      source: ToolName;
      target: ToolName;
    }>,
  ): void {
    const { action, source, target } = event.detail;

    dispatchAction(updateToolAction(action));

    dispatchAction(updateToolNameByMapping({ source, target }));

    navigateToRoute(RoutePath.EnterApiKeys);
  }
</script>

<style>
  div {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
  }
</style>

<main>
  <h1>Step 1: Pick an Action</h1>

  <HelpDetails open>
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
      action={ToolAction.Transfer}
      source={ToolName.Toggl}
      target={ToolName.Clockify}
      title="Transfer from Toggl to Clockify"
      on:select={handleCardSelect}
    >
      Transfer your entries from Toggl to Clockify.me.
    </ToolActionCard>

    <ToolActionCard
      action={ToolAction.Transfer}
      source={ToolName.Clockify}
      target={ToolName.Toggl}
      title="Transfer from Clockify to Toggl"
      on:select={handleCardSelect}
    >
      Transfer your entries from Clockify.me to Toggl.
    </ToolActionCard>

    <ToolActionCard
      action={ToolAction.Delete}
      source={ToolName.Clockify}
      target={ToolName.None}
      title="Delete Clockify Records"
      on:select={handleCardSelect}
    >
      Bulk delete content from your Clockify.me account.
    </ToolActionCard>

    <ToolActionCard
      action={ToolAction.Delete}
      source={ToolName.Toggl}
      target={ToolName.None}
      title="Delete Toggl Records"
      on:select={handleCardSelect}
    >
      Bulk delete content from your Toggl account.
    </ToolActionCard>
  </div>
</main>
