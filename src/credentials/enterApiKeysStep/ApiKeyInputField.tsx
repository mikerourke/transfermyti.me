import React from "react";
import * as R from "ramda";
import { ExternalLink, styled } from "~/components";
import { ToolHelpDetailsModel } from "~/app/appTypes";

const ErrorMessage = styled.div(
  {
    fontSize: "0.875rem",
    marginTop: "-0.75rem",
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
    fontSize: "1rem",
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
}) => (
  <>
    <Label htmlFor={mapping}>
      {toolHelpDetails.displayName} API Key (
      <ExternalLink href={toolHelpDetails.toolLink}>
        find it on your {toolHelpDetails.displayName} profile page
      </ExternalLink>
      )
    </Label>
    <Input
      id={mapping}
      name={mapping}
      type="text"
      autoComplete="hidden"
      aria-describedby={`${mapping}Error`}
      aria-required={true}
      aria-invalid={!R.isNil(errorMessage).toString()}
      {...props}
    />
    <ErrorMessage id={`${mapping}Error`}>{errorMessage}</ErrorMessage>
  </>
);

export default ApiKeyInputField;
