import React from "react";
import { ModalDialog } from "~/components";

interface Props {
  isOpen: boolean;
  onClose: VoidFunction;
}

const NoSelectionsModal: React.FC<Props> = props => (
  <ModalDialog isOpen={props.isOpen} title="Error" onClose={props.onClose}>
    <p>You haven&apos;t selected any records to include in the transfer.</p>
    <p>
      Please ensure you have checked the checkbox next to the records you&apos;d
      like to include before proceeding.
    </p>
  </ModalDialog>
);

export default NoSelectionsModal;
