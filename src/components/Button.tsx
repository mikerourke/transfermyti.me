import React from "react";

import { styled } from "./emotion";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Loading = styled.span`
  display: block;
  position: relative;
  height: 1.5rem;
  width: 1.5rem;
  border-radius: 50%;
  font-size: 0.75rem;
  animation: loading-spin 1.4s infinite linear;
  transform: translateZ(0);
  background: linear-gradient(
    to right,
    var(--color-primary) 10%,
    var(--color-secondary) 40%
  );

  &::before {
    position: absolute;
    top: 0;
    left: 0;
    height: 50%;
    width: 50%;
    border-radius: 100% 0 0 0;
    content: "";
    background-color: var(--color-secondary);
  }

  &::after {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    height: 75%;
    width: 75%;
    margin: auto;
    border-radius: 50%;
    content: "";
    background-color: var(--color-primary);
  }
`;

const DefaultButton = styled.button`
  padding: 0.5rem 0.75rem;
  vertical-align: middle;
  border-radius: 0.375rem;
  text-align: center;
  font-size: 1.25rem;
  font-weight: 400;
  background-color: var(--color-midnight);
  color: var(--color-secondary);
  box-shadow: var(--elevation-dp1);
  opacity: 1;
  transition: all 250ms linear;

  &:disabled {
    cursor: default;
    opacity: 0.5;
  }

  &:hover:not(:disabled) {
    opacity: 0.8;
    text-decoration: underline;
  }

  &:focus {
    outline-color: var(--color-primary);
  }
`;

const EggplantButton = styled(DefaultButton)`
  background-color: var(--color-eggplant);
`;

const OutlineButton = styled(DefaultButton)`
  background-color: var(--color-secondary);
  color: var(--color-primary);
  border: 3px solid var(--color-primary);
`;

const PrimaryButton = styled(DefaultButton)`
  background-color: var(--color-primary);
  color: var(--color-secondary);
`;

const SecondaryButton = styled(DefaultButton)`
  background-color: var(--color-secondary);
  color: var(--color-primary);
`;

type Variant = "default" | "eggplant" | "outline" | "primary" | "secondary";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  disabled?: boolean;
  loading?: boolean;
  variant?: Variant;
  onClick: VoidFunction;
}

const Button: React.FC<ButtonProps> = ({
  children,
  disabled = false,
  loading = false,
  variant = "default",
  onClick,
  ...props
}) => {
  let Button = DefaultButton;

  if (variant === "eggplant") {
    Button = EggplantButton;
  } else if (variant === "outline") {
    Button = OutlineButton;
  } else if (variant === "primary") {
    Button = PrimaryButton;
  } else if (variant === "secondary") {
    Button = SecondaryButton;
  }

  return (
    <Button
      aria-disabled={disabled}
      disabled={disabled}
      onClick={disabled || loading ? undefined : onClick}
      type="button"
      {...props}
    >
      {loading ? (
        <Wrapper data-testid="button-loading">
          <Loading />
        </Wrapper>
      ) : (
        children
      )}
    </Button>
  );
};

export default Button;
