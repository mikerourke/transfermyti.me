import React from "react";
import { push } from "connected-react-router";
import { Path } from "history";
import { connect } from "react-redux";
import { updateToolNameByMapping } from "~/app/appActions";
import { Flex, HelpDetails } from "~/components";
import TransferMappingCard from "./TransferMappingCard";
import { ToolName } from "~/allEntities/allEntitiesTypes";
import { RoutePath, ToolNameByMappingModel } from "~/app/appTypes";

interface ConnectDispatchProps {
  onPush: (path: Path) => void;
  onUpdateToolNameByMapping: (
    toolNameByMapping: ToolNameByMappingModel,
  ) => void;
}

type Props = ConnectDispatchProps;

export const SelectTransferMappingStepComponent: React.FC<Props> = props => {
  const handleTogglToClockifyClick = (): void => {
    props.onUpdateToolNameByMapping({
      source: ToolName.Toggl,
      target: ToolName.Clockify,
    });
    props.onPush(RoutePath.EnterApiKeys);
  };

  const handleClockifyToTogglClick = (): void => {
    props.onUpdateToolNameByMapping({
      source: ToolName.Clockify,
      target: ToolName.Toggl,
    });
    props.onPush(RoutePath.EnterApiKeys);
  };

  return (
    <section>
      <h1>Step 1: Select Transfer Mapping</h1>
      <HelpDetails>
        Press the <strong>Select</strong> button for the transfer type you wish
        to perform.
      </HelpDetails>
      <Flex as="ul" css={{ listStyle: "none", padding: 0 }}>
        <TransferMappingCard
          header="Transfer from Toggl to Clockify"
          onTransferClick={handleTogglToClockifyClick}
        >
          Transfer your entries from Toggl to Clockify.me.
        </TransferMappingCard>
        <TransferMappingCard
          header="Transfer from Clockify to Toggl"
          onTransferClick={handleClockifyToTogglClick}
        >
          Transfer your entries from Clockify.me to Toggl.
        </TransferMappingCard>
      </Flex>
    </section>
  );
};

const mapDispatchToProps: ConnectDispatchProps = {
  onPush: push,
  onUpdateToolNameByMapping: updateToolNameByMapping,
};

export default connect(
  null,
  mapDispatchToProps,
)(SelectTransferMappingStepComponent);
