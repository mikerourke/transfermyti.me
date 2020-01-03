import React from "react";
import { styled, ThemeColors, useTheme } from "./emotion";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: keyof ThemeColors;
  disabled?: boolean;
  onClick: VoidFunction;
}

const Root = styled.button({
  border: "none",
  borderRadius: "0.25rem",
  fontSize: 14,
  fontWeight: 400,
  padding: "0.5rem 0.75rem",
  textAlign: "center",
  verticalAlign: "middle",

  "&:hover": {
    opacity: 0.75,
  },
});

const Button: React.FC<ButtonProps> = ({
  color = "midnight",
  disabled = false,
  onClick,
  ...props
}) => {
  const theme = useTheme();
  const textColor = [
    "seaglass",
    "silver",
    "alto",
    "gallery",
    "alabaster",
    "white",
  ].includes(color)
    ? theme.colors.black
    : theme.colors.white;

  return (
    <Root
      aria-disabled={disabled}
      css={{
        background: theme.colors[color],
        color: textColor,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.75 : 1,
      }}
      onClick={disabled ? undefined : onClick}
      {...props}
    />
  );
};

export default Button;
