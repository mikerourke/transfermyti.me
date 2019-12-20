import React from "react";
import {
  Button,
  Modal,
  ModalBackground,
  ModalCard,
  ModalCardBody,
  ModalCardFooter,
  ModalCardHeader,
  ModalCardTitle,
} from "bloomer";

interface Props {
  isActive: boolean;
  onConfirmClick: () => void;
  onCancelClick: () => void;
}

const ConfirmationModal: React.FC<Props> = ({
  isActive,
  onConfirmClick,
  onCancelClick,
}) => (
  <Modal isActive={isActive}>
    <ModalBackground />
    <ModalCard>
      <ModalCardHeader>
        <ModalCardTitle css={{ fontSize: "2.5rem", fontWeight: 500 }}>
          Confirmation
        </ModalCardTitle>
      </ModalCardHeader>
      <ModalCardBody css={{ "p:not(:last-child)": { marginBottom: "1rem" } }}>
        <p>
          If you&apos;re psychologically and emotionally ready to proceed, just
          hit that ol&apos; yellow button down there. The transfer process will
          start and you&apos;ll be living the dream in no time.
        </p>
        <p>
          If you&apos;re not quite ready, no sweat, just hit the
          <strong> Cancel</strong> button and regroup.
        </p>
      </ModalCardBody>
      <ModalCardFooter css={{ justifyContent: "flex-end" }}>
        <Button isSize="medium" onClick={onCancelClick} isColor="dark">
          Cancel
        </Button>
        <Button isSize="medium" onClick={onConfirmClick} isColor="warning">
          Start the Damn Transfer!
        </Button>
      </ModalCardFooter>
    </ModalCard>
  </Modal>
);

export default ConfirmationModal;
