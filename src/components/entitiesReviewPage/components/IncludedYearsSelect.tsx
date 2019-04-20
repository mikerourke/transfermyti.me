import React, { CSSProperties } from 'react';
import Select from 'react-select';
import { compact, get } from 'lodash';
import { css } from 'emotion';
import makeAnimated from 'react-select/lib/animated';
import { FontWeightProperty } from 'csstype';
import { ActionMeta, Theme } from 'react-select/lib/types';

const getTheme = (theme: Theme) => ({
  ...theme,
  colors: {
    ...theme.colors,
    primary: 'var(--info)',
  },
});

const fontStyle = {
  fontSize: '1rem',
  fontWeight: 'bold' as FontWeightProperty,
};

const BORDER_RADIUS = 4;

const colorStyles = {
  control: (styles: CSSProperties) => ({
    ...styles,
    backgroundColor: 'white',
  }),
  option: (styles: CSSProperties, { isDisabled }: { isDisabled: boolean }) => {
    return {
      ...styles,
      ...fontStyle,
      background: 'white',
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      ':hover': {
        background: 'var(--light-gray)',
      },
    };
  },
  multiValue: (styles: CSSProperties) => ({
    ...styles,
    ...fontStyle,
  }),
  multiValueLabel: (styles: CSSProperties) => ({
    ...styles,
    ...fontStyle,
    background: 'var(--info)',
    borderRadius: 0,
    borderBottomLeftRadius: BORDER_RADIUS,
    borderTopLeftRadius: BORDER_RADIUS,
    color: 'white',
  }),
  multiValueRemove: (styles: CSSProperties) => ({
    ...styles,
    background: 'var(--info)',
    borderRadius: 0,
    borderBottomRightRadius: BORDER_RADIUS,
    borderTopRightRadius: BORDER_RADIUS,
    color: 'white',
    ':hover': {
      cursor: 'pointer',
      opacity: 0.7,
    },
  }),
};

interface Props {
  inclusionsByYear: Record<number, boolean>;
  onUpdateIncludedYear: (year: number, isIncluded: boolean) => void;
}

interface OptionType {
  label: string;
  value: number;
}

const IncludedYearsSelect: React.FC<Props> = ({
  inclusionsByYear,
  onUpdateIncludedYear,
}) => {
  const { options, values } = Object.entries(inclusionsByYear).reduce(
    (acc, [year, isIncluded]) => {
      const option = { label: year.toString(), value: +year };
      return {
        options: compact([...acc.options, option]),
        values: compact([...acc.values, isIncluded && option]),
      };
    },
    { options: [], values: [] },
  );

  const onChange = (
    selectOption: Array<OptionType>,
    actionMeta: ActionMeta,
  ) => {
    switch (actionMeta.action) {
      case 'select-option':
        const yearToInclude = get(actionMeta, ['option', 'value']);
        onUpdateIncludedYear(yearToInclude, true);
        break;

      case 'remove-value':
        const yearToExclude = get(actionMeta, ['removedValue', 'value']);
        onUpdateIncludedYear(yearToExclude, false);
        break;

      case 'clear':
        options.forEach(({ value }) => onUpdateIncludedYear(value, false));
        break;

      default:
        break;
    }
  };

  return (
    <div
      className={css`
        margin: 0 1rem 0.75rem 1rem;
      `}
    >
      <Select
        isMulti
        value={values}
        options={options}
        styles={colorStyles}
        theme={getTheme}
        closeMenuOnSelect={false}
        components={makeAnimated()}
        onChange={onChange}
      />
    </div>
  );
};

export default IncludedYearsSelect;
