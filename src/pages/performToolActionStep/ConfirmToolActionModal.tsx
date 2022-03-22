import React from "react";

import { Button, ModalDialog } from "~/components";
import type { ToolAction } from "~/typeDefs";

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
        <li>
          <Button onClick={onClose}>Cancel</Button>
        </li>

        <li>
          <Button variant="primary" onClick={onConfirm}>
            Start
          </Button>
        </li>
      </>
    }
    onClose={onClose}
    {...props}
  >
    <p>
      Pressing the <strong>Start</strong> button will {toolAction} the records
      you selected. Would you like to continue?
    </p>

    <p className="note">
      Note: This action cannot be undone and will probably take awhile.
    </p>
  </ModalDialog>
);

export default ConfirmToolActionModal;
