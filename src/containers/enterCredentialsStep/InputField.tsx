import React from "react";
import { When } from "react-if";
import { Control, Field, Help, Input, Label } from "bloomer";
import HelpTooltip from "./HelpTooltip";

interface Props extends React.HTMLProps<HTMLInputElement> {
  name: string;
  label: string;
  tooltip: React.ReactElement<unknown> | React.ReactChild;
  errorText?: string;
}

const InputField: React.FC<Props> = ({
  name,
  label,
  tooltip,
  errorText,
  ...props
}) => (
  <Field>
    <Label>
      <span>{label}</span>
      <HelpTooltip tipId={`${name}-help`}>{tooltip}</HelpTooltip>
    </Label>
    <Control>
      <Input
        name={name}
        placeholder={`Enter ${label}`}
        css={{ backgroundColor: errorText !== "" && "rgba(255, 0, 0, 0.1)" }}
        {...props}
      />
    </Control>
    <When condition={errorText !== ""}>
      <Help isColor="danger" css={{ fontWeight: "bold" }}>
        {errorText}
      </Help>
    </When>
  </Field>
);

export default InputField;
