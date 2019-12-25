import React from "react";
import { connect } from "react-redux";
import { push } from "connected-react-router";
import { Path } from "history";
import { PanelGroup, Panel } from "rsuite";
import { selectActiveWorkspaceId } from "~/workspaces/workspacesSelectors";
import ClientsTable from "~/clients/clientsTable/ClientsTable";
import { NavigationButtonsRow } from "~/components";
import { RoutePath } from "~/app/appTypes";
import { ReduxState } from "~/redux/reduxTypes";

interface ConnectStateProps {
  activeWorkspaceId: string;
}

interface ConnectDispatchProps {
  onPush: (path: Path) => void;
}

type Props = ConnectStateProps & ConnectDispatchProps;

export const SelectSourceInclusionsComponent: React.FC<Props> = props => {
  const handleBackClick = (): void => {
    props.onPush(RoutePath.Workspaces);
  };

  const handleNextClick = (): void => {
    props.onPush(RoutePath.ReviewTarget);
  };

  return (
    <div>
      <PanelGroup accordion bordered>
        <Panel header="Projects" defaultExpanded>
          Projects
        </Panel>
        <Panel header="Clients">
          <ClientsTable />
        </Panel>
        <Panel header="Tags">Tags</Panel>
        <Panel header="Tasks">Tasks</Panel>
        <Panel header="Time Entries">Time Entries</Panel>
      </PanelGroup>
      <NavigationButtonsRow
        onBackClick={handleBackClick}
        onNextClick={handleNextClick}
      />
    </div>
  );
};

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  activeWorkspaceId: selectActiveWorkspaceId(state),
});

const mapDispatchToProps: ConnectDispatchProps = {
  onPush: push,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SelectSourceInclusionsComponent);
