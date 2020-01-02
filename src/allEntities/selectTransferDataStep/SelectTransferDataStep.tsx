import React from "react";
import { push } from "connected-react-router";
import { Path } from "history";
import { connect } from "react-redux";
import { PayloadActionCreator } from "typesafe-actions";
import { fetchAllEntities } from "~/allEntities/allEntitiesActions";
import {
  areEntitiesFetchingSelector,
  entityGroupInProcessDisplaySelector,
} from "~/allEntities/allEntitiesSelectors";
import { activeWorkspaceIdSelector } from "~/workspaces/workspacesSelectors";
import {
  Accordion,
  HelpDetails,
  Loader,
  LoadingMessage,
  NavigationButtonsRow,
} from "~/components";
import ClientsTable from "~/clients/clientsTable/ClientsTable";
import ProjectsTable from "~/projects/projectsTable/ProjectsTable";
import TagsTable from "~/tags/tagsTable/TagsTable";
import TasksTable from "~/tasks/tasksTable/TasksTable";
import TimeEntriesTable from "~/timeEntries/timeEntriesTable/TimeEntriesTable";
import { RoutePath } from "~/app/appTypes";
import { ReduxState } from "~/redux/reduxTypes";

interface ConnectStateProps {
  activeWorkspaceId: string;
  areEntitiesFetching: boolean;
  entityGroupInProcessDisplay: string;
}

interface ConnectDispatchProps {
  onFetchAllEntities: PayloadActionCreator<string, void>;
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
          The badge to the left of the group name represents how many records
          are present. If you uncheck the <strong>Show Existing </strong>
          checkbox in the table footer, only the records that do not exist on
          the target tool will be shown.
        </p>
        <p>
          Press the <strong>Next</strong> button when you&apos;re ready to begin
          the transfer.
        </p>
        <p css={{ fontStyle: "italic" }}>
          Note: The transfer will <strong>not</strong> start until you confirm
          it on the next page.
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
        <Accordion css={{ marginBottom: "2rem" }}>
          <ClientsTable />
          <TagsTable />
          <ProjectsTable />
          <TasksTable />
          <TimeEntriesTable />
        </Accordion>
      )}
      <NavigationButtonsRow
        disabled={props.areEntitiesFetching}
        onBackClick={handleBackClick}
        onNextClick={handleNextClick}
        onRefreshClick={() => props.onFetchAllEntities()}
      />
    </section>
  );
};

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  activeWorkspaceId: activeWorkspaceIdSelector(state),
  areEntitiesFetching: areEntitiesFetchingSelector(state),
  entityGroupInProcessDisplay: entityGroupInProcessDisplaySelector(state),
});

const mapDispatchToProps: ConnectDispatchProps = {
  onFetchAllEntities: fetchAllEntities.request,
  onPush: push,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SelectTransferDataStepComponent);
