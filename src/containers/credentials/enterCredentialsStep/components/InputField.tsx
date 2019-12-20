import React from "react";
import classnames from "classnames";
import { When } from "react-if";
import { Control, Field, Help, Input, Label } from "bloomer";
import { css } from "emotion";
import HelpTooltip from "./HelpTooltip";

interface Props extends React.HTMLProps<HTMLInputElement> {
  name: string;
  label: string;
  tooltip: React.ReactElement<unknown> | React.ReactChild;
  className?: string;
  errorText?: string;
}

const InputField: React.FC<Props> = ({
  name,
  label,
  tooltip,
  className,
  errorText,
  ...inputProps
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
        className={classnames(className, {
          [css({ backgroundColor: "rgba(255, 0, 0, 0.1)" })]: errorText !== "",
        })}
        {...inputProps}
      />
    </Control>
    <When condition={errorText !== ""}>
      <Help isColor="danger" className={css({ fontWeight: "bold" })}>
        {errorText}
      </Help>
    </When>
  </Field>
);

export default InputField;
