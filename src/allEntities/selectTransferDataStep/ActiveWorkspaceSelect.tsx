import React from "react";
import { connect } from "react-redux";
import { updateActiveWorkspaceId } from "~/workspaces/workspacesActions";
import {
  activeWorkspaceIdSelector,
  includedSourceWorkspacesSelector,
} from "~/workspaces/workspacesSelectors";
import { styled } from "~/components";
import { ReduxState } from "~/redux/reduxTypes";
import { WorkspaceModel } from "~/workspaces/workspacesTypes";

const Base = styled.div(
  {
    position: "relative",
    display: "inline-block",
    marginBottom: "1rem",
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
    borderRadius: "0.375rem",
    border: "none",
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
    position: "absolute",
    bottom: "1.125rem",
    right: "1.5rem",
    width: 0,
    height: 0,
    pointerEvents: "none",
    borderStyle: "solid",
    borderWidth: "0.5rem 0.5rem 0",
    borderBottomColor: "transparent",
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
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
      <Label htmlFor="activeWorkspaceSelect">Active Workspace</Label>
      <Select
        id="activeWorkspaceSelect"
        name="activeWorkspaceSelect"
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
