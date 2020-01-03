import React from "react";
import { connect } from "react-redux";
import { updateActiveWorkspaceId } from "~/workspaces/workspacesActions";
import {
  activeWorkspaceIdSelector,
  sourceWorkspacesSelector,
} from "~/workspaces/workspacesSelectors";
import { styled } from "~/components";
import { ReduxState } from "~/redux/reduxTypes";
import { WorkspaceModel } from "~/workspaces/workspacesTypes";

const Root = styled.div(
  {
    position: "relative",
    display: "inline-block",
    marginBottom: "1rem",
    width: "100%",
  },
  ({ theme }) => ({
    "&:hover,&:focus": {
      select: {
        borderColor: theme.colors.cornflower,
        color: theme.colors.cornflower,
      },

      span: {
        borderTopColor: theme.colors.cornflower,
      },
    },
  }),
);

const Label = styled.label({
  fontSize: "1rem",
  fontWeight: "bold",
});

const Select = styled.select(
  {
    appearance: "none",
    borderRadius: "0.375rem",
    cursor: "pointer",
    display: "inline-block",
    fontSize: "1rem",
    marginTop: "0.5rem",
    padding: "0.75rem 1rem",
    width: "100%",
    borderWidth: 1,
    borderStyle: "solid",
  },
  ({ theme }) => ({
    background: theme.colors.white,
    borderColor: theme.colors.midnight,
    color: theme.colors.midnight,
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
    <Root>
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
    </Root>
  );
};

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  activeWorkspaceId: activeWorkspaceIdSelector(state),
  workspaces: sourceWorkspacesSelector(state),
});

const mapDispatchToProps: ConnectDispatchProps = {
  onUpdateActiveWorkspaceId: updateActiveWorkspaceId,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ActiveWorkspaceSelectComponent);
