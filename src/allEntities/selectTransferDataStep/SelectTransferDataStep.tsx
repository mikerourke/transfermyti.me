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
} from "~/allEntities/allEntitiesSelectors";
import Button from "~/components/Button";
import { activeWorkspaceIdSelector } from "~/workspaces/workspacesSelectors";
import ClientsTable from "~/clients/clientsTable/ClientsTable";
import ProjectsTable from "~/projects/projectsTable/ProjectsTable";
import TagsTable from "~/tags/tagsTable/TagsTable";
import TasksTable from "~/tasks/tasksTable/TasksTable";
import TimeEntriesTable from "~/timeEntries/timeEntriesTable/TimeEntriesTable";
import {
  Accordion,
  HelpDetails,
  Loader,
  LoadingMessage,
  NavigationButtonsRow,
} from "~/components";
import ActiveWorkspaceSelect from "./ActiveWorkspaceSelect";
import ShowExistingToggle from "./ShowExistingToggle";
import { RoutePath } from "~/app/appTypes";
import { ReduxState } from "~/redux/reduxTypes";

interface ConnectStateProps {
  activeWorkspaceId: string;
  areEntitiesFetching: boolean;
  areExistsInTargetShown: boolean;
  entityGroupInProcessDisplay: string;
}

interface ConnectDispatchProps {
  onFetchAllEntities: PayloadActionCreator<string, void>;
  onFlipIfExistsInTargetShown: PayloadActionCreator<string, void>;
  onPush: (path: Path) => void;
}

type Props = ConnectStateProps & ConnectDispatchProps;

export const SelectTransferDataStepComponent: React.FC<Props> = props => {
  const handleBackClick = (): void => {
    props.onPush(RoutePath.SelectWorkspaces);
  };

  const handleNextClick = (): void => {
    props.onPush(RoutePath.PerformTransfer);
  };

  return (
    <section>
      <h1>Step 4: Select Data to Transfer</h1>
      <HelpDetails>
        <p>
          Review the records you&apos;d like to include in the transfer. If the
          record already exists on the target tool, the option to include it is
          disabled.
        </p>
        <p>
          Change the active workspace by selecting it from the
          <strong> Active Workspace</strong> dropdown. Toggling
          <strong> Show records that already exist in target </strong>
          will either show or hide the records that already exist in the target
          tool. The footer for each table contains the totals associated with
          the corresponding column.
        </p>
        <p>
          Press the <strong>Next</strong> button when you&apos;re ready to begin
          the transfer.
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
            <ClientsTable />
            <TagsTable />
            <ProjectsTable />
            <TasksTable />
            <TimeEntriesTable />
          </Accordion>
        </div>
      )}
      <NavigationButtonsRow
        disabled={props.areEntitiesFetching}
        onBackClick={handleBackClick}
        onNextClick={handleNextClick}
      >
        <Button
          variant="outline"
          disabled={props.areEntitiesFetching}
          onClick={() => props.onFetchAllEntities()}
        >
          Refresh
        </Button>
      </NavigationButtonsRow>
    </section>
  );
};

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  activeWorkspaceId: activeWorkspaceIdSelector(state),
  areEntitiesFetching: areEntitiesFetchingSelector(state),
  areExistsInTargetShown: areExistsInTargetShownSelector(state),
  entityGroupInProcessDisplay: entityGroupInProcessDisplaySelector(state),
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
