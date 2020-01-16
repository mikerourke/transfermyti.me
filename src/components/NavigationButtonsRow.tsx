import React from "react";
import Button from "./Button";
import { styled } from "./emotion";

const Base = styled.nav(
  {
    marginTop: "1rem",

    button: {
      minHeight: "3rem",
      minWidth: "6.5rem",

      ":not(:last-of-type)": {
        marginRight: "0.75rem",
      },
    },
  },
  ({ theme }) => ({
    [theme.query.mobile]: {
      button: {
        minWidth: "unset",
      },
    },
  }),
);

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
  <Base {...props}>
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
  </Base>
);

export default NavigationButtonsRow;
