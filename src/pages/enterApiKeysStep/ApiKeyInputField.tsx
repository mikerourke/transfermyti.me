import cuid from "cuid";
import React from "react";

import { ExternalLink, styled } from "~/components";
import { ToolHelpDetailsModel } from "~/typeDefs";

const StyledField = styled.div`
  label {
    display: block;
    margin: 0.5rem 0;
    font-size: 1rem;
    font-weight: var(--font-weight-bold);
  }

  input {
    width: 100%;
    margin-bottom: 2rem;
    padding: 0.5rem;
    border: none;
    border-radius: 0.25rem;
    font-family: monospace;
    font-size: 1.25rem;
    box-shadow: var(--elevation-dp2);
  }

  span {
    display: block;
    margin-top: -1.5rem;
    color: var(--color-ruby);
    font-weight: var(--font-weight-bold);
  }
`;

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  mapping: string;
  toolHelpDetails: ToolHelpDetailsModel;
  errorMessage?: string | null;
}

const ApiKeyInputField: React.FC<Props> = ({
  mapping,
  toolHelpDetails,
  errorMessage = null,
  ...props
}) => {
  const inputId = cuid.slug();
  const inputErrorId = `${inputId}-error`;

  return (
    <StyledField>
      <label htmlFor={inputId}>
        {toolHelpDetails.displayName} API Key (
        <ExternalLink color="var(--color-navy)" href={toolHelpDetails.toolLink}>
          find it on your {toolHelpDetails.displayName} profile page
        </ExternalLink>
        )
      </label>

      <input
        id={inputId}
        name={mapping}
        type="text"
        autoComplete="off"
        aria-describedby={inputErrorId}
        aria-required={true}
        aria-invalid={errorMessage !== null}
        {...props}
      />

      <span id={inputErrorId}>{errorMessage}</span>
    </StyledField>
  );
};

export default ApiKeyInputField;
