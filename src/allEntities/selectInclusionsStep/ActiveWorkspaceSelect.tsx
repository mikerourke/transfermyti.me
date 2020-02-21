import React from "react";
import { connect } from "react-redux";
import { updateActiveWorkspaceId } from "~/workspaces/workspacesActions";
import {
  activeWorkspaceIdSelector,
  includedSourceWorkspacesSelector,
} from "~/workspaces/workspacesSelectors";
import { styled, WorkspaceSelect } from "~/components";
import { ReduxState, WorkspaceModel } from "~/typeDefs";

const Base = styled.div(
  {
    display: "inline-block",
    marginBottom: "1rem",
    position: "relative",
    width: "100%",
  },
  ({ theme }) => ({
    "&:hover,&:focus": {
      select: {
        color: theme.colors.primary,
      },

      span: {
        borderTopColor: theme.colors.primary,
      },
    },
  }),
);

const Label = styled.label(
  {
    fontSize: "1rem",
  },
  ({ theme }) => ({
    fontWeight: theme.fontWeights.bold,
  }),
);

interface ConnectStateProps {
  activeWorkspaceId: string;
  workspaces: WorkspaceModel[];
}

interface ConnectDispatchProps {
  onUpdateActiveWorkspaceId: (workspaceId: string) => void;
}

type Props = ConnectStateProps & ConnectDispatchProps;

export const ActiveWorkspaceSelectComponent: React.FC<Props> = props => {
  const handleSelectWorkspace = (workspace: WorkspaceModel): void => {
    props.onUpdateActiveWorkspaceId(workspace.id);
  };

  return (
    <Base>
      <Label htmlFor="active-workspace-select">Active Workspace</Label>
      <WorkspaceSelect
        id="active-workspace-select"
        name="active-workspace-select"
        workspaces={props.workspaces}
        value={props.activeWorkspaceId}
        onSelectWorkspace={handleSelectWorkspace}
      />
    </Base>
  );
};

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  activeWorkspaceId: activeWorkspaceIdSelector(state),
  workspaces: includedSourceWorkspacesSelector(state),
});

const mapDispatchToProps: ConnectDispatchProps = {
  onUpdateActiveWorkspaceId: updateActiveWorkspaceId,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ActiveWorkspaceSelectComponent);
