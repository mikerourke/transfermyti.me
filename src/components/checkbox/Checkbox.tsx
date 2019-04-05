import React from 'react';
import { css } from 'emotion';
import { CheckedState } from '~/types/commonTypes';

interface Props {
  checked: CheckedState | boolean;
  size: number | string;
  onClick: () => void;
}

const statePaths = [
  // CheckedState.Checked:
  'M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
  // CheckedState.Unchecked:
  'M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z',
  // CheckedState.Indeterminate:
  'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2z',
];

const Checkbox: React.FC<Props> = ({ checked, size, onClick }) => {
  let state = 0;
  if (typeof checked === 'boolean') {
    state = checked ? CheckedState.Checked : CheckedState.Unchecked;
  } else {
    state = checked;
  }

  return (
    <svg
      viewBox="0 0 24 24"
      height={size}
      width={size}
      onClick={onClick}
      className={css`
        cursor: pointer;
      `}
    >
      <path d={statePaths[state]} fill="var(--info)" />
    </svg>
  );
};

export default Checkbox;
