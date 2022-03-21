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

const ShowExistingToggle: React.FC<Props> = ({
  isToggled,
  onToggle,
  ...props
}) => (
  <StyledField {...props}>
    <label htmlFor="show-existing-toggle">
      Show records that already exist in target?
    </label>

    <Toggle
      id="show-existing-toggle"
      aria-label="Show records that already exist in target?"
      isToggled={isToggled}
      onToggle={onToggle}
    />
  </StyledField>
);

export default ShowExistingToggle;
