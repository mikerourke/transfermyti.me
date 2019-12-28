import React from "react";
import * as R from "ramda";
import { styled, ExternalLink } from "~/components";
import { ToolHelpDetailsModel } from "~/app/appTypes";

const ErrorMessage = styled.span(
  {
    fontSize: "0.75rem",
    fontWeight: 400,
  },
  ({ theme }) => ({
    color: theme.colors.error,
    marginTop: "0.5rem",
  }),
);

const Input = styled.input({
  width: "100%",
  fontSize: "1rem",
  padding: "0.5rem",
  borderRadius: "0.25rem",
  borderStyle: "groove",
});

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
  const { displayName, toolLink } = toolHelpDetails;
  const errorId = `${mapping}-help-text`;
  return (
    <>
      <Label htmlFor={mapping}>
        {displayName} API Key (
        <ExternalLink href={toolLink}>
          find it on your {displayName} profile page
        </ExternalLink>
        )
      </Label>
      <Input
        id={mapping}
        type="text"
        autoComplete="hidden"
        aria-describedby={errorId}
        aria-invalid={!R.isNil(errorMessage).toString()}
        {...props}
      />
      {errorMessage && <ErrorMessage id={errorId}>{errorMessage}</ErrorMessage>}
    </>
  );
};

export default ApiKeyInputField;
