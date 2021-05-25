import cuid from "cuid";
import React from "react";

import { ExternalLink, styled } from "~/components";
import { ToolHelpDetailsModel } from "~/typeDefs";

const ErrorMessage = styled.div(
  {
    marginTop: "-1.5rem",
  },
  ({ theme }) => ({
    color: theme.colors.error,
    fontWeight: theme.fontWeights.bold,
  }),
);

const Input = styled.input(
  {
    border: "none",
    borderRadius: "0.25rem",
    fontFamily: "monospace",
    fontSize: "1.25rem",
    marginBottom: "2rem",
    padding: "0.5rem",
    width: "100%",
  },
  ({ theme }) => ({
    boxShadow: theme.elevation.dp2,
  }),
);

const Label = styled.label(
  {
    display: "block",
    fontSize: "1rem",
    margin: "0.5rem 0",
  },
  ({ theme }) => ({
    fontWeight: theme.fontWeights.bold,
  }),
);

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
    <>
      <Label htmlFor={inputId}>
        {toolHelpDetails.displayName} API Key (
        <ExternalLink href={toolHelpDetails.toolLink}>
          find it on your {toolHelpDetails.displayName} profile page
        </ExternalLink>
        )
      </Label>
      <Input
        id={inputId}
        name={mapping}
        type="text"
        autoComplete="hidden"
        aria-describedby={inputErrorId}
        aria-required={true}
        aria-invalid={errorMessage !== null}
        {...props}
      />
      <ErrorMessage id={inputErrorId}>{errorMessage}</ErrorMessage>
    </>
  );
};

export default ApiKeyInputField;
