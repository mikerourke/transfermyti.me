import React from "react";
import * as R from "ramda";
import Button from "./Button";
import { styled } from "./emotion";

const Root = styled.nav({
  marginTop: "1rem",

  button: {
    minWidth: "5rem",

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
  onRefreshClick?: VoidFunction;
}

const NavigationButtonsRow: React.FC<Props> = ({
  disabled = false,
  nextLabel = "Next",
  onBackClick,
  onNextClick,
  onRefreshClick,
  ...props
}) => (
  <Root {...props}>
    <Button color="manatee" disabled={disabled} onClick={onBackClick}>
      Back
    </Button>
    <Button color="cornflower" disabled={disabled} onClick={onNextClick}>
      {nextLabel}
    </Button>
    {!R.isNil(onRefreshClick) && (
      <Button color="eggplant" disabled={disabled} onClick={onRefreshClick}>
        Refresh
      </Button>
    )}
  </Root>
);

export default NavigationButtonsRow;
