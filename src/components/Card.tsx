import React from "react";
import { styled } from "./emotion";

const Root = styled.li(
  {
    flex: "0 0 16rem",
    margin: "0 1rem 1rem",
    padding: "1rem",
    borderRadius: "0.5rem",
  },
  ({ theme }) => ({
    background: theme.colors.white,
    border: `1px solid ${theme.colors.manatee}`,
  }),
);

interface Props {
  title: React.ReactNode;
}

const Card: React.FC<Props> = ({ children, title, ...props }) => (
  <Root {...props}>
    <h3>{title}</h3>
    {children}
  </Root>
);

export default Card;
