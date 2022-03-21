import React from "react";

import Button from "./Button";
import { styled } from "./emotion";

const StyledNav = styled.nav`
  margin-top: 1rem;

  button {
    min-height: 3rem;
    min-width: 6.5rem;

    &:not(:last-of-type) {
      margin-right: 0.75rem;
    }
  }

  @media (max-width: 32rem) {
    button {
      min-width: unset;
    }
  }
`;

interface Props {
  disabled?: boolean;
  loading?: boolean;
  nextLabel?: string;
  onBackClick: VoidFunction;
  onNextClick: VoidFunction;
}

const NavigationButtonsRow: React.FC<Props> = ({
  disabled = false,
  loading = false,
  nextLabel = "Next",
  children,
  onBackClick,
  onNextClick,
  ...props
}) => (
  <StyledNav {...props}>
    <Button variant="default" disabled={disabled} onClick={onBackClick}>
      Back
    </Button>

    <Button
      variant="primary"
      disabled={disabled}
      loading={loading}
      onClick={onNextClick}
    >
      {nextLabel}
    </Button>

    {children}
  </StyledNav>
);

export default NavigationButtonsRow;
