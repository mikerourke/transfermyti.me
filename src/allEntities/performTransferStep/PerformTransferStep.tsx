import React from "react";
import { push } from "connected-react-router";
import { Path } from "history";
import { connect } from "react-redux";
import { PayloadActionCreator } from "typesafe-actions";
import { createAllEntities } from "~/allEntities/allEntitiesActions";
import {
  transferCountsByEntityGroupSelector,
  areEntitiesCreatingSelector,
} from "~/allEntities/allEntitiesSelectors";
import { Flex, HelpDetails, NavigationButtonsRow } from "~/components";
import ProgressBar from "./ProgressBar";
import { TransferCountsByEntityGroupModel } from "~/allEntities/allEntitiesTypes";
import { RoutePath } from "~/app/appTypes";
import { ReduxState } from "~/redux/reduxTypes";

interface ConnectStateProps {
  areEntitiesCreating: boolean;
  transferCountsByEntityGroup: TransferCountsByEntityGroupModel;
}

interface ConnectDispatchProps {
  onCreateAllEntities: PayloadActionCreator<string, void>;
  onPush: (path: Path) => void;
}

type Props = ConnectStateProps & ConnectDispatchProps;

export const PerformTransferStepComponent: React.FC<Props> = props => {
  const handleBackClick = (): void => {
    props.onPush(RoutePath.SelectTransferData);
  };

  const {
    clients,
    tags,
    projects,
    tasks,
    timeEntries,
  } = props.transferCountsByEntityGroup;

  return (
    <section>
      <h1>Step 5: Perform Transfer</h1>
      <HelpDetails>
        Press the <strong>Start Transfer</strong> button to start the transfer.
      </HelpDetails>
      <Flex direction="column">
        <ProgressBar
          css={{ marginTop: 0 }}
          title="Clients"
          countComplete={clients.countComplete}
          countTotal={clients.countTotal}
        />
        <ProgressBar
          title="Tags"
          countComplete={tags.countComplete}
          countTotal={tags.countTotal}
        />
        <ProgressBar
          title="Projects"
          countComplete={projects.countComplete}
          countTotal={projects.countTotal}
        />
        <ProgressBar
          title="Tasks"
          countComplete={tasks.countComplete}
          countTotal={tasks.countTotal}
        />
        <ProgressBar
          title="Time Entries"
          countComplete={timeEntries.countComplete}
          countTotal={timeEntries.countTotal}
        />
      </Flex>
      <NavigationButtonsRow
        disabled={props.areEntitiesCreating}
        nextLabel="Start Transfer"
        onBackClick={handleBackClick}
        onNextClick={() => props.onCreateAllEntities()}
      />
    </section>
  );
};

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  areEntitiesCreating: areEntitiesCreatingSelector(state),
  transferCountsByEntityGroup: transferCountsByEntityGroupSelector(state),
});

const mapDispatchToProps: ConnectDispatchProps = {
  onCreateAllEntities: createAllEntities.request,
  onPush: push,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(PerformTransferStepComponent);
