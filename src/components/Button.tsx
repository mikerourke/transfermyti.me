import Color from "color";
import React from "react";
import { styled, useTheme } from "./emotion";

type Variant = "primary" | "secondary" | "default" | "outline";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  disabled?: boolean;
  variant?: Variant;
  onClick: VoidFunction;
}

const Root = styled.button({
  borderRadius: "0.25rem",
  fontSize: "1.25rem",
  fontWeight: 400,
  padding: "0.5rem 0.75rem",
  textAlign: "center",
  verticalAlign: "middle",
});

const Button: React.FC<ButtonProps> = ({
  disabled = false,
  variant = "default",
  onClick,
  ...props
}) => {
  const { colors } = useTheme();
  const variantColor = {
    default: colors.midnight,
    outline: colors.secondary,
    primary: colors.primary,
    secondary: colors.secondary,
  }[variant];

  const mainColor = Color(variantColor);
  const altColor = mainColor.isDark()
    ? Color(colors.secondary)
    : Color(colors.primary);

  const isOutline = variant === "outline";

  return (
    <Root
      aria-disabled={disabled}
      css={{
        background: mainColor.hex(),
        borderWidth: 3,
        borderStyle: "solid",
        borderColor: isOutline ? altColor.hex() : mainColor.hex(),
        color: altColor.hex(),
        opacity: disabled ? 0.75 : 1,

        "&:hover": {
          background: isOutline ? "initial" : mainColor.darken(0.1).hex(),
          borderColor: isOutline
            ? altColor.lighten(0.1).hex()
            : mainColor.darken(0.1).hex(),
          textDecoration: disabled ? "none" : "underline",
        },

        "&:focus": {
          outlineColor:
            variant === "secondary" ? colors.secondary : colors.primary,
        },
      }}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      type="button"
      {...props}
    />
  );
};

export default Button;
