import React from "react";
import Button from "./Button";
import { styled } from "./emotion";
import Flex from "./Flex";

const Base = styled(Flex)(
  {
    button: {
      borderRadius: "0.25rem",
      fontSize: "0.875rem",
      padding: "0.25rem 0.5rem",
    },
  },
  ({ theme }) => ({
    button: {
      fontWeight: theme.fontWeights.bold,
    },
  }),
);

interface Props extends React.HTMLProps<HTMLHeadingElement> {
  flipDisabled?: boolean;
  onFlipAreAllIncluded: VoidFunction;
}

const InclusionsTableTitle: React.FC<Props> = ({
  children,
  flipDisabled = false,
  onFlipAreAllIncluded,
  ...props
}) => (
  <Base alignItems="center" justifyContent="space-between">
    <h4 {...props}>{children}</h4>
    <Button
      disabled={flipDisabled}
      variant="outline"
      onClick={() => onFlipAreAllIncluded()}
    >
      Include All/None
    </Button>
  </Base>
);

export default InclusionsTableTitle;
