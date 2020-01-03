import React from "react";
import { styled } from "./emotion";

type Size = "large" | "small";

const height = (size: Size): string => (size === "small" ? "1.5rem" : "2rem");

const width = (size: Size): string => (size === "small" ? "3.5rem" : "4.5rem");

const scale = (value: string, percentage: number): string => {
  const numericValue = parseFloat(value.replace("rem", ""));
  return (numericValue * percentage).toFixed(3).concat("rem");
};

const Button = styled.button<{ size: Size }>(
  {
    border: 0,
    display: "inline-block",
    overflow: "hidden",
    position: "relative",
    transition: "background 0.1s ease-in-out",
  },
  ({ size, theme }) => ({
    borderRadius: height(size),
    boxShadow: theme.elevation.dp2,
    height: height(size),
    width: width(size),
  }),
);

const Switch = styled.span<{
  isToggled: boolean;
  size: Size;
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
  ({ isToggled, size, theme }) => ({
    background: isToggled ? theme.colors.primary : theme.colors.silver,
    boxShadow: theme.elevation.dp2,
    fontSize: scale(height(size), 0.5),
    fontWeight: theme.fontWeights.bold,
    left: isToggled ? scale(width(size), 0.6125) : scale(width(size), 0.05),
    top: scale(height(size), 0.1),
    height: scale(height(size), 0.8),
    width: scale(height(size), 0.8),

    "&::before,&::after": {
      color: theme.colors.primary,
      lineHeight: scale(height(size), 0.8),
    },

    "&::before": {
      content: isToggled ? `"YES"` : undefined,
      left: isToggled ? scale(width(size), -0.5) : undefined,
    },

    "&::after": {
      content: isToggled ? undefined : `"NO"`,
      right: isToggled ? undefined : scale(width(size), -0.475),
    },
  }),
);

interface Props {
  isToggled: boolean;
  size?: Size;
  onToggle: VoidFunction;
}

const Toggle: React.FC<Props> = ({
  isToggled,
  size = "large",
  onToggle,
  ...props
}) => (
  <Button
    aria-checked={isToggled}
    role="switch"
    size={size}
    onClick={onToggle}
    {...props}
  >
    <Switch isToggled={isToggled} size={size} />
  </Button>
);

export default Toggle;
