import React from "react";
import { styled, useTheme, ThemeColors } from "./emotion";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: keyof ThemeColors;
}

const ButtonBase = styled.button({
  border: "none",
  borderRadius: "0.25rem",
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 400,
  outline: "none",
  padding: "0.5rem 0.75rem",
  textAlign: "center",
  verticalAlign: "middle",

  "&:hover": {
    opacity: 0.75,
  },
});

const Button: React.FC<ButtonProps> = ({ color = "midnight", ...props }) => {
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
    <ButtonBase
      css={{ color: textColor, background: theme.colors[color] }}
      {...props}
    />
  );
};

export default Button;
