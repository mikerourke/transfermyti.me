import React from "react";
import { ModalDialog, styled } from "~/components";
import { WorkspaceModel } from "~/typeDefs";

const ListItem = styled.li(
  {
    padding: "0.25rem 0",
  },
  ({ theme }) => ({
    fontWeight: theme.fontWeights.bold,
  }),
);

interface Props {
  isOpen: boolean;
  targetToolDisplayName: string;
  workspaces: WorkspaceModel[];
  onClose: VoidFunction;
}

const MissingWorkspacesModal: React.FC<Props> = ({
  targetToolDisplayName,
  ...props
}) => (
  <ModalDialog isOpen={props.isOpen} title="Error" onClose={props.onClose}>
    <p>
      The workspaces you selected don&apos;t exist in {targetToolDisplayName},
      and this tool is unable to create them.
    </p>
    <p>Please manually create the following workspaces before proceeding:</p>
    <ul>
      {props.workspaces.map(workspace => (
        <ListItem key={workspace.id}>{workspace.name}</ListItem>
      ))}
    </ul>
  </ModalDialog>
);

export default MissingWorkspacesModal;
