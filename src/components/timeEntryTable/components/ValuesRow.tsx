import React from "react";
import { css } from "emotion";

interface Props {
  isBottomPadded: boolean;
}

const ValuesRow: React.FC<Props> = ({ children, isBottomPadded }) => (
  <tr
    data-testid="time-entry-table-values-row"
    className={css`
      td {
        font-size: 14px;
        font-weight: 400;
        ${isBottomPadded && "padding-bottom: 4px;"};
      }
    `}
  >
    {children}
  </tr>
);

export default ValuesRow;
