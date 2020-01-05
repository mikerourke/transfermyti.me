import React from "react";
import Button from "./Button";
import { styled } from "./emotion";

const Root = styled.nav({
  marginTop: "1rem",

  button: {
    minWidth: "6.5rem",

    ":not(:last-of-type)": {
      marginRight: "0.75rem",
    },
  },
});

interface Props {
  disabled?: boolean;
  nextLabel?: string;
  onBackClick: VoidFunction;
  onNextClick: VoidFunction;
}

const NavigationButtonsRow: React.FC<Props> = ({
  disabled = false,
  nextLabel = "Next",
  children,
  onBackClick,
  onNextClick,
  ...props
}) => (
  <Root {...props}>
    <Button variant="default" disabled={disabled} onClick={onBackClick}>
      Back
    </Button>
    <Button variant="primary" disabled={disabled} onClick={onNextClick}>
      {nextLabel}
    </Button>
    {children}
  </Root>
);

export default NavigationButtonsRow;
