import React from "react";
import { push } from "connected-react-router";
import { Path } from "history";
import { connect } from "react-redux";
import { FlexboxGrid } from "rsuite";
import { updateToolNameByMapping } from "~/app/appActions";
import { HelpMessage } from "~/components";
import TransferMappingCard from "./TransferMappingCard";
import { RoutePath, ToolNameByMappingModel } from "~/app/appTypes";
import { ToolName} from "~/common/commonTypes";

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
    props.onPush(RoutePath.Credentials);
  };

  const handleClockifyToTogglClick = (): void => {
    props.onUpdateToolNameByMapping({
      source: ToolName.Clockify,
      target: ToolName.Toggl,
    });
    props.onPush(RoutePath.Credentials);
  };

  return (
    <div>
      <HelpMessage title="Transfer Type">
        Press the <strong>Select</strong> button for the transfer type you wish
        to perform.
      </HelpMessage>
      <FlexboxGrid css={{ marginTop: "1rem" }}>
        <TransferMappingCard
          header="From Toggl to Clockify"
          onTransferClick={handleTogglToClockifyClick}
        >
          Transfer your entries from Toggl to Clockify.me.
        </TransferMappingCard>
        <TransferMappingCard
          header="From Clockify to Toggl"
          onTransferClick={handleClockifyToTogglClick}
        >
          Transfer your entries from Clockify.me to Toggl.
        </TransferMappingCard>
      </FlexboxGrid>
    </div>
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
