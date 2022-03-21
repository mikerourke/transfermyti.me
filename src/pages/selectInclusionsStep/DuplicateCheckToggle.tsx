import React from "react";

import { styled, Toggle } from "~/components";

const StyledField = styled.div`
  margin-bottom: 0.75rem;

  label {
    display: block;
    margin-bottom: 0.75rem;
    font-weight: var(--font-weight-bold);
  }

  button {
    background-color: var(--color-white);
  }
`;

interface Props {
  isToggled: boolean;
  onToggle: VoidFunction;
}

const DuplicateCheckToggle: React.FC<Props> = ({
  isToggled,
  onToggle,
  ...props
}) => (
  <StyledField {...props}>
    <label htmlFor="use-duplicate-check-toggle">
      Use the time entry duplication check?
    </label>

    <Toggle
      id="use-duplicate-check-toggle"
      aria-label="Use the time entry duplication check?"
      isToggled={isToggled}
      onToggle={onToggle}
    />
  </StyledField>
);

export default DuplicateCheckToggle;
