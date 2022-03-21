import React from "react";
import { Link } from "react-router-dom";

import { styled } from "~/components";
import Logo from "~/layout/Logo";
import { RoutePath } from "~/typeDefs";

const StyledHeader = styled.header`
  display: flex;
  align-items: center;
  height: 3rem;
  width: 100%;
  padding: 0 1rem;
  background-color: var(--color-primary);
  color: var(--color-secondary);
`;

const Header: React.FC = () => (
  <StyledHeader>
    <Logo />

    <Link
      css={(theme) => ({ color: theme.colors.secondary, fontSize: "1.5rem" })}
      to={RoutePath.PickToolAction}
    >
      transfermyti.me
    </Link>
  </StyledHeader>
);

export default Header;
