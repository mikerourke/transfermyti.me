import React from "react";

import { ModalDialog } from "~/components";

interface Props {
  isOpen: boolean;
  onClose: VoidFunction;
}

const NoWorkspacesModal: React.FC<Props> = (props) => (
  <ModalDialog isOpen={props.isOpen} title="Error" onClose={props.onClose}>
    <p>You haven&apos;t selected any workspaces to include in the transfer.</p>
    <p>
      Please ensure the workspaces you&apos;d like to transfer are toggled to
      <strong> Yes</strong>.
    </p>
  </ModalDialog>
);

export default NoWorkspacesModal;
