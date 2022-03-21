import { css } from "@emotion/react";
import React from "react";

import { styled } from "./emotion";

const StyledButton = styled.button`
  display: inline-block;
  position: relative;
  height: 2rem;
  width: 4.5rem;
  overflow: hidden;
  border: none;
  border-radius: 2rem;
  box-shadow: var(--elevation-dp2);
  transition: background 0.1s ease-in-out;
`;

const StyledSwitch = styled.span`
  display: inline-block;
  position: absolute;
  top: 0.2rem;
  height: 1.6rem;
  width: 1.6rem;
  font-size: 1rem;
  font-weight: var(--font-weight-bold);
  border-radius: 50%;
  box-shadow: var(--elevation-dp2);
  pointer-events: none;
  text-transform: uppercase;
  transition: 250ms;

  &::before,
  &::after {
    position: absolute;
    display: block;
    color: var(--color-primary);
    line-height: 1.7rem;
  }
`;

interface Props extends React.HTMLAttributes<HTMLElement> {
  isToggled: boolean;
  onToggle: VoidFunction;
}

const Toggle: React.FC<Props> = ({ isToggled, onToggle, ...props }) => {
  const isToggledStyleClass = css`
    background-color: var(--color-primary);
    left: 2.75rem;

    &::before {
      content: "YES";
      left: -2.25rem;
    }
  `;

  const isNotToggledStyleClass = css`
    background-color: var(--color-silver);
    left: 0.225rem;

    &::after {
      content: "NO";
      right: -2.1375rem;
      color: var(--color-silver);
    }
  `;

  return (
    <StyledButton
      aria-checked={isToggled}
      role="switch"
      onClick={onToggle}
      {...props}
    >
      <StyledSwitch
        css={isToggled ? isToggledStyleClass : isNotToggledStyleClass}
      />
    </StyledButton>
  );
};

export default Toggle;
