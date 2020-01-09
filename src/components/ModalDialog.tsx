import Color from "color";
import cuid from "cuid";
import React from "react";
import { createPortal } from "react-dom";
import { Transition } from "react-transition-group";
import Button from "./Button";
import { styled } from "./emotion";
import { useModalAccessibility } from "./hooks";
import Flex from "./Flex";

const Backdrop = styled(Flex)(
  {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflowY: "hidden",
    transition: "opacity 100ms ease-in-out",
    zIndex: 1,
  },
  ({ theme }) => ({
    background: Color(theme.colors.midnight)
      .alpha(0.9)
      .hsl()
      .string(),
  }),
);

const Container = styled.div(
  {
    borderRadius: "0.25rem",
    marginTop: "20%",
    maxWidth: "32rem",
    minWidth: "24rem",
    padding: "1.5rem",
    zIndex: 2,

    h2: {
      margin: "0 0 1.5rem",
    },
  },
  ({ theme }) => ({
    background: theme.colors.secondary,
    boxShadow: theme.elevation.dp8,
  }),
);

const Description = styled.div({
  p: {
    margin: "1rem 0",
  },
});

const ActionsRow = styled(Flex)({
  marginTop: "2rem",

  button: {
    border: "none",
    borderRadius: "0.25rem",
    fontSize: "1rem",
    padding: "0.5rem 0.75rem",
    minWidth: "4rem",

    "&:not(:last-of-type)": {
      marginRight: "0.75rem",
    },
  },
});

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
  const modalId = cuid.slug();
  useModalAccessibility(isOpen, onClose);

  return (
    <ModalPortal>
      <Transition in={isOpen} timeout={100} unmountOnExit mountOnEnter>
        {state => (
          <Backdrop
            alignItems="flex-start"
            justifyContent="center"
            css={{ opacity: state === "entered" ? 1 : 0 }}
          >
            <Container
              role={role}
              id={modalId}
              aria-describedby={`${modalId}Desc`}
              aria-labelledby={`${modalId}Title`}
              aria-hidden={!isOpen}
              aria-modal
              {...props}
            >
              <div role="document">
                <h2 id={`${modalId}Title`}>{title}</h2>
                <Description id={`${modalId}Desc`}>{children}</Description>
                <ActionsRow justifyContent="flex-end">
                  {actions ?? (
                    <Button variant="primary" onClick={onClose}>
                      OK
                    </Button>
                  )}
                </ActionsRow>
              </div>
            </Container>
          </Backdrop>
        )}
      </Transition>
    </ModalPortal>
  );
};

export default ModalDialog;
