import React from "react";

import { styled } from "./emotion";

const StyledListItem = styled.li`
  display: flex;
  flex: 0 0 20rem;
  flex-direction: column;
  margin: 0 1rem 2rem;
  padding: 1rem;
  border-radius: 0.5rem;
  background-color: var(--color-primary);
  color: var(--color-secondary);
  box-shadow: var(--elevation-dp4);

  @media (max-width: 32rem) {
    flex-basis: 16rem;
  }
`;

interface Props {
  title: React.ReactNode;
}

const Card: React.FC<Props> = ({ children, title, ...props }) => (
  <StyledListItem {...props}>
    <h2>{title}</h2>
    {children}
  </StyledListItem>
);

export default Card;
