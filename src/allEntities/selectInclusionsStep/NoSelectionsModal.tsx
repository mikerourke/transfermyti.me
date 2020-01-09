import React from "react";
import { ModalDialog } from "~/components";

// TODO: Add links for filing an issue/contacting the developer.

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
    <p>
      Alternatively, all of the records may already exist on the target tool. If
      you believe this is an error, please file a GitHub issue or contact the
      developer.
    </p>
  </ModalDialog>
);

export default NoSelectionsModal;
