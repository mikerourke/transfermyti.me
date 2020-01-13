import React from "react";
import { connect } from "react-redux";
import { updateActiveWorkspaceId } from "~/workspaces/workspacesActions";
import {
  activeWorkspaceIdSelector,
  includedSourceWorkspacesSelector,
} from "~/workspaces/workspacesSelectors";
import { styled } from "~/components";
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

const Select = styled.select(
  {
    appearance: "none",
    border: "none",
    borderRadius: "0.375rem",
    cursor: "pointer",
    display: "inline-block",
    fontSize: "1rem",
    marginTop: "0.5rem",
    padding: "0.75rem 1rem",
    width: "100%",
  },
  ({ theme }) => ({
    background: theme.colors.white,
    boxShadow: theme.elevation.dp2,
    color: theme.colors.primary,
  }),
);

const Arrow = styled.span(
  {
    borderBottomColor: "transparent",
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderStyle: "solid",
    borderWidth: "0.5rem 0.5rem 0",
    bottom: "1.125rem",
    height: 0,
    pointerEvents: "none",
    position: "absolute",
    right: "1.5rem",
    width: 0,
  },
  ({ theme }) => ({
    borderTopColor: theme.colors.midnight,
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
  const handleSelectChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    props.onUpdateActiveWorkspaceId(event.target.value);
  };

  return (
    <Base>
      <Label htmlFor="active-workspace-select">Active Workspace</Label>
      <Select
        id="active-workspace-select"
        name="active-workspace-select"
        value={props.activeWorkspaceId}
        onChange={handleSelectChange}
      >
        {props.workspaces.map(workspace => (
          <option
            key={workspace.id}
            label={workspace.name}
            value={workspace.id}
          >
            {workspace.name}
          </option>
        ))}
      </Select>
      <Arrow />
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
