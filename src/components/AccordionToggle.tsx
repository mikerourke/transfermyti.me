import React from "react";
import { styled } from "./emotion";
import Icon from "./Icon";

const ToggleButton = styled.button(
  {
    alignItems: "center",
    appearance: "none",
    border: "none",
    display: "flex",
    fontSize: "1.25rem",
    justifyContent: "space-between",
    marginBottom: "1rem",
    padding: "0.75rem 1rem",
    textAlign: "left",
    width: "100%",
  },
  ({ theme }) => ({
    backgroundColor: theme.colors.white,
    borderRadius: "0.375rem",
    boxShadow: theme.elevation.dp2,
    color: theme.colors.primary,

    "&:hover": {
      backgroundColor: theme.colors.primary,
      color: theme.colors.white,
      textDecoration: "underline",

      path: {
        fill: theme.colors.white,
      },
    },
  }),
);

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: string;
  isExpanded: boolean;
  onToggle: (isExpanded: boolean) => void;
}

const AccordionToggle: React.FC<Props> = ({
  children,
  isExpanded,
  onToggle,
  ...props
}) => (
  <h3 css={{ margin: 0 }}>
    <ToggleButton
      aria-expanded={isExpanded}
      onClick={() => onToggle(!isExpanded)}
      {...props}
    >
      {children}
      <Icon
        color="primary"
        name={isExpanded ? "circleRemove" : "circleAdd"}
        size={32}
      />
    </ToggleButton>
  </h3>
);

export default AccordionToggle;
