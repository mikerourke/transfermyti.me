import React from "react";
import { When } from "react-if";
import { isNil } from "lodash";
import { Button } from "rsuite";
import styled from "@emotion/styled";

const Root = styled.div({
  marginTop: "2rem",

  button: {
    width: "5rem",
    ":not(:last-of-type)": { marginRight: "0.75rem" },
  },
});

interface Props {
  isLoading?: boolean;
  onBackClick: VoidFunction;
  onNextClick: VoidFunction;
  onRefreshClick?: VoidFunction;
}

const NavigationButtonsRow: React.FC<Props> = ({
  isLoading = false,
  onBackClick,
  onNextClick,
  onRefreshClick,
  ...props
}) => (
  <Root {...props}>
    <Button appearance="default" onClick={onBackClick}>
      Back
    </Button>
    <Button appearance="primary" onClick={onNextClick} loading={isLoading}>
      Next
    </Button>
    <When condition={!isNil(onRefreshClick)}>
      <Button color="violet" onClick={onRefreshClick}>
        Refresh
      </Button>
    </When>
  </Root>
);

export default NavigationButtonsRow;
