import React from "react";
import { styled } from "~/components";

const Root = styled.header(
  {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "3rem",
    width: "100%",
    padding: "0 1rem",
  },
  ({ theme }) => ({
    color: theme.colors.alto,
    background: theme.colors.cornflower,
  }),
);

const Header: React.FC = () => (
  <Root>
    <span css={{ fontSize: "1.5rem" }}>transfermyti.me</span>
  </Root>
);

export default Header;
