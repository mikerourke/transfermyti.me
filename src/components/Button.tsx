import Color from "color";
import React from "react";
import { styled, useTheme } from "./emotion";

type Variant =
  | "primary"
  | "secondary"
  | "default"
  | "outlinePrimary"
  | "outlineDefault";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  disabled?: boolean;
  variant?: Variant;
  onClick: VoidFunction;
}

const Root = styled.button({
  borderRadius: "0.375rem",
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
  const mainColorByVariant = {
    default: colors.midnight,
    outlineDefault: colors.secondary,
    outlinePrimary: colors.secondary,
    primary: colors.primary,
    secondary: colors.secondary,
  }[variant];

  const altColorByVariant = {
    default: colors.secondary,
    outlineDefault: colors.midnight,
    outlinePrimary: colors.primary,
    primary: colors.secondary,
    secondary: colors.primary,
  }[variant];

  const mainColor = Color(mainColorByVariant);
  const altColor = Color(altColorByVariant);

  const isOutline = /outline/gi.test(variant);

  return (
    <Root
      aria-disabled={disabled}
      css={{
        background: mainColor.hex(),
        borderWidth: 3,
        borderStyle: "solid",
        borderColor: isOutline ? altColor.hex() : mainColor.hex(),
        color: altColor.hex(),
        opacity: disabled ? 0.5 : 1,

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
