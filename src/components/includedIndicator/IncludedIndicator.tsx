import React from 'react';
import { css } from 'emotion';

interface Props {
  isIncluded: boolean;
  size: number | string;
  onClick: () => void;
}

const uncheckedBoxPath = `
  M400 32
  H48
  C21.5 32 0 53.5 0 80
  v352
  c0 26.5 21.5 48 48 48
  h352
  c26.5 0 48-21.5 48-48
  V80
  c0-26.5-21.5-48-48-48z
  m-6 400
  H54
  c-3.3 0-6-2.7-6-6
  V86
  c0-3.3 2.7-6 6-6
  h340
  c3.3 0 6 2.7 6 6
  v340
  c0 3.3-2.7 6-6 6z
`;

const checkedBoxPath = `
  ${uncheckedBoxPath}
  m-35.864-241.724
  L191.547 361.48
  c-4.705 4.667-12.303 4.637-16.97-.068
  l-90.781-91.516
  c-4.667-4.705-4.637-12.303.069-16.971
  l22.719-22.536
  c4.705-4.667 12.303-4.637 16.97.069
  l59.792 60.277 141.352-140.216
  c4.705-4.667 12.303-4.637 16.97.068
  l22.536 22.718
  c4.667 4.706 4.637 12.304-.068 16.971z
`;

const IncludedIndicator: React.FunctionComponent<Props> = ({
  isIncluded,
  size,
  onClick,
}) => (
  <svg
    viewBox="0 0 448 512"
    height={size}
    width={size}
    onClick={onClick}
    className={css`
      cursor: pointer;
    `}
  >
    <path
      d={isIncluded ? checkedBoxPath : uncheckedBoxPath}
      fill="var(--dark-gray)"
    />
  </svg>
);

export default IncludedIndicator;
