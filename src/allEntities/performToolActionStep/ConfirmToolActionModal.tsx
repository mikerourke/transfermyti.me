import React from "react";

import { Button, ModalDialog, Note } from "~/components";
import { ToolAction } from "~/typeDefs";

interface Props {
  isOpen: boolean;
  toolAction: ToolAction;
  onClose: VoidFunction;
  onConfirm: VoidFunction;
}

const ConfirmToolActionModal: React.FC<Props> = ({
  isOpen,
  toolAction,
  onClose,
  onConfirm,
  ...props
}) => (
  <ModalDialog
    isOpen={isOpen}
    title="Confirmation"
    actions={
      <>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={onConfirm}>
          Start
        </Button>
      </>
    }
    onClose={onClose}
    {...props}
  >
    <p>
      Pressing the <strong>Start</strong> button will {toolAction} the records
      you selected. Would you like to continue?
    </p>
    <Note>
      Note: This action cannot be undone and will probably take awhile.
    </Note>
  </ModalDialog>
);

export default ConfirmToolActionModal;
