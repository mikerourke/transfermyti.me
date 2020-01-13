import React from "react";
import { styled } from "./emotion";

const Button = styled.button(
  {
    border: "none",
    borderRadius: "2rem",
    display: "inline-block",
    height: "2rem",
    width: "4.5rem",
    overflow: "hidden",
    position: "relative",
    transition: "background 0.1s ease-in-out",
  },
  ({ theme }) => ({
    boxShadow: theme.elevation.dp2,
  }),
);

const Switch = styled.span<{
  isToggled: boolean;
}>(
  {
    borderRadius: "50%",
    display: "inline-block",
    pointerEvents: "none",
    position: "absolute",
    textTransform: "uppercase",
    transition: "0.4s",

    "&::before,&::after": {
      display: "block",
      position: "absolute",
    },
  },
  ({ isToggled, theme }) => ({
    background: isToggled ? theme.colors.primary : theme.colors.silver,
    boxShadow: theme.elevation.dp2,
    fontSize: "1rem",
    fontWeight: theme.fontWeights.bold,
    left: isToggled ? "2.75rem" : "0.225rem",
    top: "0.2rem",
    height: "1.6rem",
    width: "1.6rem",

    "&::before,&::after": {
      color: theme.colors.primary,
      lineHeight: "1.7rem",
    },

    "&::before": {
      content: isToggled ? `"YES"` : undefined,
      left: isToggled ? "-2.25rem" : undefined,
    },

    "&::after": {
      content: isToggled ? undefined : `"NO"`,
      right: isToggled ? undefined : "-2.1375rem",
    },
  }),
);

interface Props {
  isToggled: boolean;
  onToggle: VoidFunction;
}

const Toggle: React.FC<Props> = ({ isToggled, onToggle, ...props }) => (
  <Button aria-checked={isToggled} role="switch" onClick={onToggle} {...props}>
    <Switch isToggled={isToggled} />
  </Button>
);

export default Toggle;
