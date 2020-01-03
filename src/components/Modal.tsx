import React from "react";
import { styled } from "./emotion";

// TODO: Finish this component.

const Dialog = styled.div({
  padding: "1rem",
  position: "absolute",
  top: "2rem",
  left: "50vw",
  transform: "translateX(-50%)",
  minWidth: 480,
  maxWidth: 720,
});

interface Props {
  isOpen: boolean;
}

const Modal: React.FC<Props> = props => (
  <Dialog
    role="dialog"
    id="modalDialog"
    aria-labelledby="modalDialogLabel"
    aria-modal
  >
    <h2>Modal Dialog</h2>
  </Dialog>
);

export default Modal;
