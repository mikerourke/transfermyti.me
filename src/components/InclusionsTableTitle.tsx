import React from "react";

import Button from "./Button";
import { styled } from "./emotion";

const StyledDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  button {
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    font-weight: var(--font-weight-bold);
  }
`;

interface Props extends React.HTMLProps<HTMLHeadingElement> {
  flipDisabled?: boolean;
  onFlipAreAllIncluded: VoidFunction;
}

const InclusionsTableTitle: React.FC<Props> = ({
  children,
  flipDisabled = false,
  onFlipAreAllIncluded,
  ...props
}) => {
  const handleIncludeButtonClick = (): void => {
    onFlipAreAllIncluded();
  };

  return (
    <StyledDiv>
      <h4 {...props}>{children}</h4>

      <Button
        disabled={flipDisabled}
        variant="outline"
        onClick={handleIncludeButtonClick}
      >
        Include All/None
      </Button>
    </StyledDiv>
  );
};

export default InclusionsTableTitle;
