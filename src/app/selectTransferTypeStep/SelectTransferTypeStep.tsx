import React from "react";
import { connect } from "react-redux";
import { push } from "connected-react-router";
import { FlexboxGrid } from "rsuite";
import { Path } from "history";
import { updateTransferMapping } from "~/app/appActions";
import { HelpMessage } from "~/components";
import TransferTypeCard from "./TransferTypeCard";
import { RoutePath } from "~/app/appTypes";
import { ToolName, TransferMappingModel } from "~/common/commonTypes";

interface ConnectDispatchProps {
  onPush: (path: Path) => void;
  onUpdateTransferMapping: (transferMapping: TransferMappingModel) => void;
}

export const SelectTransferTypeStepComponent: React.FC<ConnectDispatchProps> = props => {
  const handleTogglToClockifyClick = (): void => {
    props.onUpdateTransferMapping({
      source: ToolName.Toggl,
      target: ToolName.Clockify,
    });
    props.onPush(RoutePath.Credentials);
  };

  const handleClockifyToTogglClick = (): void => {
    props.onUpdateTransferMapping({
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
        <TransferTypeCard
          header="From Toggl to Clockify"
          onTransferClick={handleTogglToClockifyClick}
        >
          Transfer your entries from Toggl to Clockify.me.
        </TransferTypeCard>
        <TransferTypeCard
          header="From Clockify to Toggl"
          onTransferClick={handleClockifyToTogglClick}
        >
          Transfer your entries from Clockify.me to Toggl.
        </TransferTypeCard>
      </FlexboxGrid>
    </div>
  );
};

const mapDispatchToProps: ConnectDispatchProps = {
  onPush: push,
  onUpdateTransferMapping: updateTransferMapping,
};

export default connect(
  null,
  mapDispatchToProps,
)(SelectTransferTypeStepComponent);
