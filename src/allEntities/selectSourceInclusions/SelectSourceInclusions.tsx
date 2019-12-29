import React from "react";
import { push } from "connected-react-router";
import { Path } from "history";
import { connect } from "react-redux";
import { PayloadActionCreator } from "typesafe-actions";
import { fetchClients } from "~/clients/clientsActions";
import {
  areEntitiesFetchingSelector,
  sourceRecordsByEntityGroupSelector,
} from "~/allEntities/allEntitiesSelectors";
import { fetchProjects } from "~/projects/projectsActions";
import { fetchTags } from "~/tags/tagsActions";
import { fetchTasks } from "~/tasks/tasksActions";
import { fetchTimeEntries } from "~/timeEntries/timeEntriesActions";
import { fetchUserGroups } from "~/userGroups/userGroupsActions";
import { fetchUsers } from "~/users/usersActions";
import { activeWorkspaceIdSelector } from "~/workspaces/workspacesSelectors";
import {
  Accordion,
  AccordionPanel,
  Loader,
  NavigationButtonsRow,
} from "~/components";
import ClientsTable from "~/clients/clientsTable/ClientsTable";
import { RoutePath } from "~/app/appTypes";
import { EntityGroup, BaseEntityModel } from "~/allEntities/allEntitiesTypes";
import { ReduxState } from "~/redux/reduxTypes";

interface ConnectStateProps {
  activeWorkspaceId: string;
  areEntitiesFetching: boolean;
  sourceRecordsByEntityGroup: Record<EntityGroup, BaseEntityModel[]>;
}

interface ConnectDispatchProps {
  onFetchClients: PayloadActionCreator<string, void>;
  onFetchProjects: PayloadActionCreator<string, void>;
  onFetchTags: PayloadActionCreator<string, void>;
  onFetchTasks: PayloadActionCreator<string, void>;
  onFetchTimeEntries: PayloadActionCreator<string, void>;
  onFetchUserGroups: PayloadActionCreator<string, void>;
  onFetchUsers: PayloadActionCreator<string, void>;
  onPush: (path: Path) => void;
}

type Props = ConnectStateProps & ConnectDispatchProps;

export const SelectSourceInclusionsComponent: React.FC<Props> = props => {
  React.useEffect(() => {
    if (props.sourceRecordsByEntityGroup.clients.length === 0) {
      props.onFetchClients();
    }
    if (props.sourceRecordsByEntityGroup.projects.length === 0) {
      props.onFetchProjects();
    }
    if (props.sourceRecordsByEntityGroup.tags.length === 0) {
      props.onFetchTags();
    }
    if (props.sourceRecordsByEntityGroup.tasks.length === 0) {
      props.onFetchTasks();
    }
    // if (props.sourceRecordsByEntityGroup.timeEntries.length === 0) {
    //   props.onFetchTimeEntries();
    // }
    // if (props.sourceRecordsByEntityGroup.userGroups.length === 0) {
    //   props.onFetchUserGroups();
    // }
    // if (props.sourceRecordsByEntityGroup.users.length === 0) {
    //   props.onFetchUsers();
    // }
  }, []);

  const handleBackClick = (): void => {
    props.onPush(RoutePath.Workspaces);
  };

  const handleNextClick = (): void => {
    props.onPush(RoutePath.PerformTransfer);
  };

  return (
    <section>
      <h1>Step 4: Select Data to Transfer</h1>
      {props.areEntitiesFetching ? (
        <Loader>Loading workspaces, please wait...</Loader>
      ) : (
        <Accordion css={{ marginBottom: "2rem" }}>
          <AccordionPanel rowNumber={1} title="Projects">
            Projects
          </AccordionPanel>
          <AccordionPanel rowNumber={2} title="Clients">
            <ClientsTable />
          </AccordionPanel>
          <AccordionPanel rowNumber={3} title="Tags">
            Tags
          </AccordionPanel>
          <AccordionPanel rowNumber={4} title="Tasks">
            Tasks
          </AccordionPanel>
          <AccordionPanel rowNumber={5} title="Time Entries">
            Time Entries
          </AccordionPanel>
        </Accordion>
      )}
      <NavigationButtonsRow
        onBackClick={handleBackClick}
        onNextClick={handleNextClick}
      />
    </section>
  );
};

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  activeWorkspaceId: activeWorkspaceIdSelector(state),
  areEntitiesFetching: areEntitiesFetchingSelector(state),
  sourceRecordsByEntityGroup: sourceRecordsByEntityGroupSelector(state),
});

const mapDispatchToProps: ConnectDispatchProps = {
  onFetchClients: fetchClients.request,
  onFetchProjects: fetchProjects.request,
  onFetchTags: fetchTags.request,
  onFetchTasks: fetchTasks.request,
  onFetchTimeEntries: fetchTimeEntries.request,
  onFetchUserGroups: fetchUserGroups.request,
  onFetchUsers: fetchUsers.request,
  onPush: push,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SelectSourceInclusionsComponent);
