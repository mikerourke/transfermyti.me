import React from "react";
import * as R from "ramda";
import Button from "./Button";
import { styled } from "./emotion";

const Root = styled.div({
  marginTop: "1rem",

  button: {
    width: "5rem",

    ":not(:last-of-type)": {
      marginRight: "0.75rem",
    },
  },
});

interface Props {
  onBackClick: VoidFunction;
  onNextClick: VoidFunction;
  onRefreshClick?: VoidFunction;
}

const NavigationButtonsRow: React.FC<Props> = ({
  onBackClick,
  onNextClick,
  onRefreshClick,
  ...props
}) => (
  <Root {...props}>
    <Button color="manatee" onClick={onBackClick}>
      Back
    </Button>
    <Button color="cornflower" onClick={onNextClick}>
      Next
    </Button>
    {!R.isNil(onRefreshClick) && (
      <Button color="eggplant" onClick={onRefreshClick}>
        Refresh
      </Button>
    )}
  </Root>
);

export default NavigationButtonsRow;
