import React from "react";
import { ModalDialog } from "~/components";

interface Props {
  isOpen: boolean;
  onClose: VoidFunction;
}

const DuplicateTargetsModal: React.FC<Props> = props => (
  <ModalDialog isOpen={props.isOpen} title="Error" onClose={props.onClose}>
    <p>
      You cannot select the same target workspace for two different source
      workspaces. Please either select a different target workspace or
      <strong> None</strong> from the <strong>Target Workspace </strong>
      dropdown.
    </p>
  </ModalDialog>
);

export default DuplicateTargetsModal;
