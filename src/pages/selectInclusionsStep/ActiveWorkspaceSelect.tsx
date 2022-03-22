import React from "react";
import { connect } from "react-redux";

import { styled, WorkspaceSelect } from "~/components";
import { updateActiveWorkspaceId } from "~/modules/workspaces/workspacesActions";
import {
  activeWorkspaceIdSelector,
  includedSourceWorkspacesSelector,
} from "~/modules/workspaces/workspacesSelectors";
import type { ReduxState, WorkspaceModel } from "~/typeDefs";

const StyledField = styled.div`
  position: relative;
  display: inline-block;
  width: 100%;
  margin-bottom: 1rem;

  &:hover,
  &:focus {
    select {
      color: var(--color-primary);
    }

    span {
      border-top-color: var(--color-primary);
    }
  }

  label {
    font-size: 1rem;
    font-weight: var(--font-weight-bold);
  }
`;

interface ConnectStateProps {
  activeWorkspaceId: string;
  workspaces: WorkspaceModel[];
}

interface ConnectDispatchProps {
  onUpdateActiveWorkspaceId: (workspaceId: string) => void;
}

type Props = ConnectStateProps & ConnectDispatchProps;

export const ActiveWorkspaceSelectComponent: React.FC<Props> = (props) => {
  const handleSelectWorkspace = (workspace: WorkspaceModel): void => {
    props.onUpdateActiveWorkspaceId(workspace.id);
  };

  return (
    <StyledField>
      <label htmlFor="active-workspace-select">Active Workspace</label>

      <WorkspaceSelect
        id="active-workspace-select"
        name="active-workspace-select"
        workspaces={props.workspaces}
        value={props.activeWorkspaceId}
        onSelectWorkspace={handleSelectWorkspace}
      />
    </StyledField>
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
