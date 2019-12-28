import React from "react";
import { styled } from "./emotion";

const Button = styled.button<{ isToggled: boolean }>(
  {
    border: 0,
    borderRadius: "2rem",
    clear: "both",
    display: "inline-block",
    float: "left",
    minHeight: "2rem",
    overflow: "hidden",
    position: "relative",
    transition: "background 0.1s ease-in-out",
    width: "4.5rem",
  },
  ({ isToggled, theme }) => ({
    background: isToggled ? theme.colors.cornflower : theme.colors.alto,
  }),
);

const Span = styled.span<{ isToggled: boolean }>(
  {
    background: "white",
    borderRadius: "50%",
    display: "inline-block",
    fontSize: "0.875rem",
    fontWeight: "bold",
    height: "1.625rem",
    pointerEvents: "none",
    position: "absolute",
    textTransform: "uppercase",
    top: "0.175rem",
    transition: "0.4s",
    width: "1.625rem",

    "&::before,&::after": {
      display: "block",
      position: "absolute",
      top: "0.325rem",
    },
  },
  ({ isToggled, theme }) => ({
    border: `1px solid ${theme.colors.alto}`,
    left: isToggled ? "2.625rem" : "0.175rem",

    "&::before,&::after": {
      color: isToggled ? theme.colors.white : theme.colors.midnight,
    },

    "&::before": {
      content: isToggled ? `"YES"` : undefined,
      left: isToggled ? "-2rem" : undefined,
    },

    "&::after": {
      content: isToggled ? undefined : `"NO"`,
      right: isToggled ? undefined : "-2.125rem",
    },
  }),
);

interface Props {
  isToggled: boolean;
  onToggle: VoidFunction;
}

const Toggle: React.FC<Props> = ({ isToggled, onToggle, ...props }) => (
  <Button
    aria-checked={isToggled}
    isToggled={isToggled}
    role="switch"
    onClick={onToggle}
    {...props}
  >
    <Span isToggled={isToggled} />
  </Button>
);

export default Toggle;
