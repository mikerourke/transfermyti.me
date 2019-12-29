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
  AccordionPanel,
  Loader,
  LoadingMessage,
  NavigationButtonsRow,
} from "~/components";
import ClientsTable from "~/clients/clientsTable/ClientsTable";
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

export const SelectSourceInclusionsComponent: React.FC<Props> = props => {
  React.useEffect(() => {
    props.onFetchAllEntities();
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
        <>
          <Loader />
          <LoadingMessage>
            Fetching {props.entityGroupInProcessDisplay}, please wait...
          </LoadingMessage>
        </>
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
  entityGroupInProcessDisplay: entityGroupInProcessDisplaySelector(state),
});

const mapDispatchToProps: ConnectDispatchProps = {
  onFetchAllEntities: fetchAllEntities.request,
  onPush: push,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SelectSourceInclusionsComponent);
