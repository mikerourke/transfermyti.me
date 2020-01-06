import React from "react";
import { push } from "connected-react-router";
import { Path } from "history";
import { connect } from "react-redux";
import { PayloadActionCreator } from "typesafe-actions";
import {
  fetchAllEntities,
  flipIfExistsInTargetShown,
} from "~/allEntities/allEntitiesActions";
import {
  areEntitiesFetchingSelector,
  areExistsInTargetShownSelector,
  entityGroupInProcessDisplaySelector,
  totalIncludedRecordsCountSelector,
} from "~/allEntities/allEntitiesSelectors";
import { activeWorkspaceIdSelector } from "~/workspaces/workspacesSelectors";
import ClientsInclusionsPanel from "~/clients/clientsInclusionsPanel/ClientsInclusionsPanel";
import ProjectsInclusionsPanel from "~/projects/projectsInclusionsPanel/ProjectsInclusionsPanel";
import TagsInclusionsPanel from "~/tags/tagsInclusionsPanel/TagsInclusionsPanel";
import TasksInclusionsPanel from "~/tasks/tasksInclusionsPanel/TasksInclusionsPanel";
import TimeEntriesInclusionsPanel from "~/timeEntries/timeEntriesInclusionsPanel/TimeEntriesInclusionsPanel";
import {
  Accordion,
  Button,
  HelpDetails,
  Loader,
  LoadingMessage,
  NavigationButtonsRow,
} from "~/components";
import ActiveWorkspaceSelect from "./ActiveWorkspaceSelect";
import NoSelectionsModal from "./NoSelectionsModal";
import ShowExistingToggle from "./ShowExistingToggle";
import { RoutePath } from "~/app/appTypes";
import { ReduxState } from "~/redux/reduxTypes";

interface ConnectStateProps {
  activeWorkspaceId: string;
  areEntitiesFetching: boolean;
  areExistsInTargetShown: boolean;
  entityGroupInProcessDisplay: string;
  totalIncludedRecordsCount: number;
}

interface ConnectDispatchProps {
  onFetchAllEntities: PayloadActionCreator<string, void>;
  onFlipIfExistsInTargetShown: PayloadActionCreator<string, void>;
  onPush: (path: Path) => void;
}

type Props = ConnectStateProps & ConnectDispatchProps;

export const SelectTransferDataStepComponent: React.FC<Props> = props => {
  const [isErrorModalOpen, setIsErrorModalOpen] = React.useState<boolean>(
    false,
  );

  const handleBackClick = (): void => {
    props.onPush(RoutePath.SelectWorkspaces);
  };

  const handleNextClick = (): void => {
    if (props.totalIncludedRecordsCount === 0) {
      setIsErrorModalOpen(true);
      return;
    }

    props.onPush(RoutePath.PerformTransfer);
  };

  return (
    <>
      <section>
        <h1>Step 4: Select Data to Transfer</h1>
        <HelpDetails>
          <p>
            Review the records you&apos;d like to include in the transfer. If
            the record already exists on the target tool, the option to include
            it is disabled.
          </p>
          <p>
            Change the active workspace by selecting it from the
            <strong> Active Workspace</strong> dropdown. Toggling
            <strong> Show records that already exist in target </strong>
            will either show or hide the records that already exist in the
            target tool. The footer for each table contains the totals
            associated with the corresponding column.
          </p>
          <p>
            Press the <strong>Next</strong> button when you&apos;re ready to
            begin the transfer.
            <strong css={{ marginLeft: "0.375rem" }}>
              The transfer will not start until you confirm it on the next page.
            </strong>
          </p>
        </HelpDetails>
        {props.areEntitiesFetching ? (
          <>
            <Loader />
            <LoadingMessage>
              Fetching {props.entityGroupInProcessDisplay}, please wait...
            </LoadingMessage>
          </>
        ) : (
          <div>
            <ActiveWorkspaceSelect />
            <ShowExistingToggle
              isToggled={props.areExistsInTargetShown}
              onToggle={() => props.onFlipIfExistsInTargetShown()}
            />
            <h2>Workspace Records</h2>
            <Accordion css={{ marginBottom: "2rem" }}>
              <ClientsInclusionsPanel />
              <TagsInclusionsPanel />
              <ProjectsInclusionsPanel />
              <TasksInclusionsPanel />
              <TimeEntriesInclusionsPanel />
            </Accordion>
          </div>
        )}
        <NavigationButtonsRow
          disabled={props.areEntitiesFetching}
          onBackClick={handleBackClick}
          onNextClick={handleNextClick}
        >
          <Button
            variant="outlinePrimary"
            disabled={props.areEntitiesFetching}
            onClick={() => props.onFetchAllEntities()}
          >
            Refresh
          </Button>
        </NavigationButtonsRow>
      </section>
      <NoSelectionsModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
      />
    </>
  );
};

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  activeWorkspaceId: activeWorkspaceIdSelector(state),
  areEntitiesFetching: areEntitiesFetchingSelector(state),
  areExistsInTargetShown: areExistsInTargetShownSelector(state),
  entityGroupInProcessDisplay: entityGroupInProcessDisplaySelector(state),
  totalIncludedRecordsCount: totalIncludedRecordsCountSelector(state),
});

const mapDispatchToProps: ConnectDispatchProps = {
  onFetchAllEntities: fetchAllEntities.request,
  onFlipIfExistsInTargetShown: flipIfExistsInTargetShown,
  onPush: push,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SelectTransferDataStepComponent);
