import { push } from "connected-react-router";
import React from "react";
import { connect } from "react-redux";

import ToolActionCard from "./ToolActionCard";
import {
  updateToolAction,
  updateToolNameByMapping,
} from "~/allEntities/allEntitiesActions";
import { Flex, HelpDetails } from "~/components";
import {
  RoutePath,
  ToolAction,
  ToolName,
  ToolNameByMappingModel,
} from "~/typeDefs";

interface ConnectDispatchProps {
  onPush: (path: RoutePath) => void;
  onUpdateToolAction: (toolAction: ToolAction) => void;
  onUpdateToolNameByMapping: (
    toolNameByMapping: ToolNameByMappingModel,
  ) => void;
}

type Props = ConnectDispatchProps;

export const PickToolActionStepComponent: React.FC<Props> = (props) => {
  const handleSelectClick = (
    action: ToolAction,
    source: ToolName,
    target: ToolName,
  ): void => {
    props.onUpdateToolAction(action);
    props.onUpdateToolNameByMapping({ source, target });
    props.onPush(RoutePath.EnterApiKeys);
  };

  return (
    <section>
      <h1>Step 1: Pick an Action</h1>
      <HelpDetails open>
        <p>
          Welcome to <strong>transfermyti.me</strong>! This tool can be used to
          transfer your content between time tracking tools like Toggl and
          Clockify.
        </p>
        <p>
          Each page has a help section that contains additional information
          about the step associated with that page. You can expand or collapse
          the help section by clicking on <strong>Show/Hide Help</strong>.
        </p>
        <p>
          Press the <strong>Select</strong> button for the action you wish to
          perform and you&apos;ll be guided through the appropriate steps.
        </p>
      </HelpDetails>
      <Flex
        as="ul"
        css={{ listStyle: "none", padding: 0 }}
        justifyContent="center"
        flexWrap="wrap"
      >
        <ToolActionCard
          action={ToolAction.Transfer}
          source={ToolName.Toggl}
          target={ToolName.Clockify}
          header="Transfer from Toggl to Clockify"
          onSelectClick={handleSelectClick}
        >
          Transfer your entries from Toggl to Clockify.me.
        </ToolActionCard>
        <ToolActionCard
          action={ToolAction.Transfer}
          source={ToolName.Clockify}
          target={ToolName.Toggl}
          header="Transfer from Clockify to Toggl"
          onSelectClick={handleSelectClick}
        >
          Transfer your entries from Clockify.me to Toggl.
        </ToolActionCard>
        <ToolActionCard
          action={ToolAction.Delete}
          source={ToolName.Clockify}
          target={ToolName.None}
          header="Delete Clockify Records"
          onSelectClick={handleSelectClick}
        >
          Bulk delete content from your Clockify.me account.
        </ToolActionCard>
        <ToolActionCard
          action={ToolAction.Delete}
          source={ToolName.Toggl}
          target={ToolName.None}
          header="Delete Toggl Records"
          onSelectClick={handleSelectClick}
        >
          Bulk delete content from your Toggl account.
        </ToolActionCard>
      </Flex>
    </section>
  );
};

const mapDispatchToProps: ConnectDispatchProps = {
  onPush: push,
  onUpdateToolAction: updateToolAction,
  onUpdateToolNameByMapping: updateToolNameByMapping,
};

export default connect(null, mapDispatchToProps)(PickToolActionStepComponent);
