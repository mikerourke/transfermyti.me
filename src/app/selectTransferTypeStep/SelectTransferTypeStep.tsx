import React from "react";
import { connect } from "react-redux";
import { push } from "connected-react-router";
import { FlexboxGrid } from "rsuite";
import { Path } from "history";
import { updateCurrentTransferType } from "~/app/appActions";
import { HelpMessage } from "~/components";
import TransferTypeCard from "./TransferTypeCard";
import { TransferType, RoutePath } from "~/app/appTypes";

interface ConnectDispatchProps {
  onPush: (path: Path) => void;
  onUpdateCurrentTransferType: (newTransferType: TransferType) => void;
}

export const SelectTransferTypeStepComponent: React.FC<ConnectDispatchProps> = props => {
  const handleTransferClick = (transferType: TransferType) => () => {
    props.onUpdateCurrentTransferType(transferType);
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
          onTransferClick={handleTransferClick(TransferType.TogglToClockify)}
        >
          Transfer your entries from Toggl to Clockify.me.
        </TransferTypeCard>
        <TransferTypeCard
          header="From Clockify to Toggl"
          onTransferClick={handleTransferClick(TransferType.ClockifyToToggl)}
        >
          Transfer your entries from Clockify.me to Toggl.
        </TransferTypeCard>
      </FlexboxGrid>
    </div>
  );
};

const mapDispatchToProps: ConnectDispatchProps = {
  onPush: push,
  onUpdateCurrentTransferType: updateCurrentTransferType,
};

export default connect(
  null,
  mapDispatchToProps,
)(SelectTransferTypeStepComponent);
