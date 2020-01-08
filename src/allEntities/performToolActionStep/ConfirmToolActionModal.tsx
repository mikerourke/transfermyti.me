import React from "react";
import { ToolAction } from "~/app/appTypes";
import { Button, ModalDialog } from "~/components";

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
    <p css={theme => ({ fontWeight: theme.fontWeights.bold })}>
      Note: This action cannot be undone and will probably take awhile.
    </p>
  </ModalDialog>
);

export default ConfirmToolActionModal;
