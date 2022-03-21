import React from "react";

import { styled } from "./emotion";
import Icon from "./Icon";

const StyledButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  background-color: var(--color-white);
  border-radius: 0.375rem;
  box-shadow: var(--elevation-dp2);
  color: var(--color-primary);
  font-size: 1.25rem;
  text-align: left;

  &:hover {
    background-color: var(--color-primary);
    color: var(--color-white);
    text-decoration: underline;

    path {
      fill: var(--color-white);
    }
  }
`;

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
  <h3 style={{ margin: 0 }}>
    <StyledButton
      aria-expanded={isExpanded}
      onClick={() => onToggle(!isExpanded)}
      {...props}
    >
      {children}
      <Icon
        color="var(--color-primary)"
        name={isExpanded ? "circleRemove" : "circleAdd"}
        size={32}
      />
    </StyledButton>
  </h3>
);

export default AccordionToggle;
