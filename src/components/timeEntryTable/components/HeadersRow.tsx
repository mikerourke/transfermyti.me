import React from 'react';
import { css } from 'emotion';

interface Props {
  hasTopBorder: boolean;
}

const HeadersRow: React.FunctionComponent<Props> = ({
  hasTopBorder,
  children,
}) => (
  <tr
    className={css`
      ${hasTopBorder && 'border-top: 1px solid rgba(10, 10, 10, 0.1)'};
      td {
        color: var(--info);
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        ${hasTopBorder && 'padding-top: 4px'};
      }
    `}
  >
    {children}
  </tr>
);

export default HeadersRow;
