import React from 'react';
import cx from 'classnames';
import { Control, Field, Help, Input, Label } from 'bloomer';
import { css } from 'emotion';
import ShowIf from '../../../../components/showIf/ShowIf';
import HelpTooltip from './HelpTooltip';

interface Props extends React.HTMLProps<HTMLInputElement> {
  name: string;
  label: string;
  tooltip: React.ReactElement<any> | React.ReactChild;
  className?: string;
  errorText?: string;
}

const InputField: React.FunctionComponent<Props> = ({
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
        className={cx(className, {
          [css`
            background-color: rgba(255, 0, 0, 0.1);
          `]: errorText !== '',
        })}
        {...inputProps}
      />
    </Control>
    <ShowIf
      isShown={errorText !== ''}
      as={Help}
      isColor="danger"
      className={css`
        font-weight: bold;
      `}
    >
      {errorText}
    </ShowIf>
  </Field>
);

export default InputField;
