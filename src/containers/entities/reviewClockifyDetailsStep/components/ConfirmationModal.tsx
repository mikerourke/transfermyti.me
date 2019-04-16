import React from 'react';
import {
  Button,
  Modal,
  ModalBackground,
  ModalCard,
  ModalCardBody,
  ModalCardFooter,
  ModalCardHeader,
  ModalCardTitle,
} from 'bloomer';
import { css } from 'emotion';

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
        <ModalCardTitle
          className={css`
            font-size: 2.5rem;
            font-weight: 500;
          `}
        >
          Confirmation
        </ModalCardTitle>
      </ModalCardHeader>
      <ModalCardBody
        className={css`
          p:not(:last-child) {
            margin-bottom: 1rem;
          }
        `}
      >
        <p>
          If you&apos;re psychologically and emotionally ready to proceed, just
          hit the ol&apos; <strong>Confirm</strong> button down there. The
          transfer process will start and you&apos;ll be taken to the transfer
          progress page.
        </p>
        <p>
          If you&apos;re not quite ready, no sweat, just hit the
          <strong> Cancel</strong> button and regroup.
        </p>
      </ModalCardBody>
      <ModalCardFooter
        className={css`
          justify-content: flex-end;
        `}
      >
        <Button isSize="medium" onClick={onCancelClick} isColor="dark">
          Cancel
        </Button>
        <Button isSize="medium" onClick={onConfirmClick} isColor="warning">
          Confirm
        </Button>
      </ModalCardFooter>
    </ModalCard>
  </Modal>
);

export default ConfirmationModal;
