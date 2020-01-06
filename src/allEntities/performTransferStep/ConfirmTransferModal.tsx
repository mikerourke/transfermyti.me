import React from "react";
import { Button, ModalDialog } from "~/components";

interface Props {
  isOpen: boolean;
  onClose: VoidFunction;
  onConfirm: VoidFunction;
}

const ConfirmTransferModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirm,
  ...props
}) => (
  <ModalDialog
    isOpen={isOpen}
    title="Confirmation"
    actions={
      <>
        <Button onClick={onClose}>No</Button>
        <Button variant="primary" onClick={onConfirm}>
          Yes
        </Button>
      </>
    }
    onClose={onClose}
    {...props}
  >
    <p>Would you like to start transferring now?</p>
    <p css={theme => ({ fontWeight: theme.fontWeights.bold })}>
      Note: This will probably take awhile!
    </p>
  </ModalDialog>
);

export default ConfirmTransferModal;
