import { push } from "connected-react-router";
import { Path } from "history";
import React from "react";
import { connect } from "react-redux";
import { updateToolAction, updateToolNameByMapping } from "~/app/appActions";
import { Flex, HelpDetails } from "~/components";
import TransferActionCard from "./TransferActionCard";
import { ToolName } from "~/allEntities/allEntitiesTypes";
import { RoutePath, ToolNameByMappingModel, ToolAction } from "~/app/appTypes";

interface ConnectDispatchProps {
  onPush: (path: Path) => void;
  onUpdateToolAction: (toolAction: ToolAction) => void;
  onUpdateToolNameByMapping: (
    toolNameByMapping: ToolNameByMappingModel,
  ) => void;
}

type Props = ConnectDispatchProps;

export const PickTransferActionStepComponent: React.FC<Props> = props => {
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
      <h1>Step 1: Pick a Transfer Action</h1>
      <HelpDetails>
        Press the <strong>Select</strong> button for the action you wish to
        perform.
      </HelpDetails>
      <Flex as="ul" css={{ listStyle: "none", padding: 0 }} wrap="wrap">
        <TransferActionCard
          action={ToolAction.Transfer}
          source={ToolName.Toggl}
          target={ToolName.Clockify}
          header="Transfer from Toggl to Clockify"
          onSelectClick={handleSelectClick}
        >
          Transfer your entries from Toggl to Clockify.me.
        </TransferActionCard>
        <TransferActionCard
          action={ToolAction.Transfer}
          source={ToolName.Clockify}
          target={ToolName.Toggl}
          header="Transfer from Clockify to Toggl"
          onSelectClick={handleSelectClick}
        >
          Transfer your entries from Clockify.me to Toggl.
        </TransferActionCard>
        {/*<TransferActionCard*/}
        {/*  action={ToolAction.Delete}*/}
        {/*  source={ToolName.Clockify}*/}
        {/*  target={ToolName.None}*/}
        {/*  header="Delete All Clockify Content"*/}
        {/*  onSelectClick={handleSelectClick}*/}
        {/*>*/}
        {/*  Delete everything from your Clockify.me account.*/}
        {/*</TransferActionCard>*/}
        {/*<TransferActionCard*/}
        {/*  action={ToolAction.Delete}*/}
        {/*  source={ToolName.Toggl}*/}
        {/*  target={ToolName.None}*/}
        {/*  header="Delete All Toggl Content"*/}
        {/*  onSelectClick={handleSelectClick}*/}
        {/*>*/}
        {/*  Delete everything from your Toggl account.*/}
        {/*</TransferActionCard>*/}
      </Flex>
    </section>
  );
};

const mapDispatchToProps: ConnectDispatchProps = {
  onPush: push,
  onUpdateToolAction: updateToolAction,
  onUpdateToolNameByMapping: updateToolNameByMapping,
};

export default connect(
  null,
  mapDispatchToProps,
)(PickTransferActionStepComponent);
