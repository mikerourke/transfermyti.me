import React from "react";

import { styled } from "./emotion";

const StyledDetails = styled.details`
  width: 100%;
  margin-bottom: 1rem;
  color: var(--color-primary);

  div,
  summary {
    margin: 0;
    padding: 0.5rem 0.25rem;
  }

  summary {
    font-weight: var(--font-weight-bold);
    user-select: none;
  }

  div > p:first-of-type {
    margin-top: 0;
  }

  div > p:last-of-type {
    margin-bottom: 0;
  }
`;

interface Props extends React.HTMLAttributes<HTMLDetailsElement> {
  open?: boolean;
  title?: string;
}

const HelpDetails: React.FC<Props> = ({
  children,
  title = "Show/Hide Help",
  ...props
}) => (
  <StyledDetails {...props}>
    <summary>{title}</summary>

    <div>{children}</div>

    <hr />
  </StyledDetails>
);

export default HelpDetails;
