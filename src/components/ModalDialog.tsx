import cuid from "cuid";
import React from "react";
import { createPortal } from "react-dom";
import { Transition } from "react-transition-group";

import Button from "./Button";
import { styled } from "./emotion";
import { useModalAccessibility } from "./hooks";

const StyledBackdrop = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: hidden;
  background-color: hsla(0deg 0% 24% / 60%);
  z-index: var(--z-index-backdrop);
`;

const StyledDialog = styled.dialog`
  appearance: none;
  max-width: 32rem;
  min-width: 24rem;
  padding: 2rem;
  border: none;
  border-radius: 0.25rem;
  background-color: var(--color-secondary);
  color: var(--color-midnight);
  box-shadow: var(--elevation-dp8);
  z-index: var(--z-index-dialog);

  h2 {
    margin: 0 0 1.5rem;
    font-size: 1.75rem;
  }

  p {
    margin: 1rem 0;
  }

  ul {
    display: flex;
    justify-content: flex-end;
    margin: 2rem 0 0;
    padding: 0;
  }

  li {
    list-style: none;
  }

  li:not(:last-of-type) {
    margin-right: 0.75rem;
  }

  button {
    border: none;
    border-radius: 0.25rem;
    font-size: 1rem;
    padding: 0.5rem 0.75rem;
    min-width: 6rem;
  }
`;

interface Props {
  actions?: React.ReactNode;
  children: React.ReactNode;
  role?: "dialog" | "alertdialog";
  isOpen: boolean;
  title: string;
  onClose: VoidFunction;
}

const ModalPortal: React.FC = ({ children }) => {
  const modalsContainer = document.querySelector("#modals") as HTMLDivElement;
  return createPortal(children, modalsContainer);
};

const ModalDialog: React.FC<Props> = ({
  actions,
  children,
  role = "dialog",
  isOpen,
  title,
  onClose,
  ...props
}) => {
  useModalAccessibility(isOpen, onClose);

  const modalId = cuid.slug();
  const modalDescId = `modal-${modalId}-desc`;
  const modalTitleId = `modal-${modalId}-title`;

  return (
    <ModalPortal>
      <Transition in={isOpen} timeout={100} unmountOnExit mountOnEnter>
        {(state) => (
          <StyledBackdrop style={{ opacity: state === "entered" ? 1 : 0 }}>
            <StyledDialog
              role={role}
              id={modalId}
              aria-describedby={modalDescId}
              aria-labelledby={modalTitleId}
              aria-hidden={!isOpen}
              aria-modal
              open={isOpen}
              {...props}
            >
              <div role="document">
                <h2 id={modalTitleId}>{title}</h2>

                <div id={modalDescId}>{children}</div>

                <ul>
                  {actions ?? (
                    <li>
                      <Button variant="primary" onClick={onClose}>
                        OK
                      </Button>
                    </li>
                  )}
                </ul>
              </div>
            </StyledDialog>
          </StyledBackdrop>
        )}
      </Transition>
    </ModalPortal>
  );
};

export default ModalDialog;
