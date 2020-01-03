import React from "react";
import { styled } from "./emotion";

const Root = styled.li(
  {
    flex: "0 0 24rem",
    margin: "0 1rem 1rem",
    padding: "1rem",
    borderRadius: "0.5rem",
  },
  ({ theme }) => ({
    background: theme.colors.primary,
    color: theme.colors.secondary,
    boxShadow: theme.elevation.dp4,
  }),
);

interface Props {
  title: React.ReactNode;
}

const Card: React.FC<Props> = ({ children, title, ...props }) => (
  <Root {...props}>
    <h2>{title}</h2>
    {children}
  </Root>
);

export default Card;
