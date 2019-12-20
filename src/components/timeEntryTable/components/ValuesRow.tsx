import React from "react";
import { css } from "emotion";

interface Props {
  isBottomPadded: boolean;
}

const ValuesRow: React.FC<Props> = ({ children, isBottomPadded }) => (
  <tr
    data-testid="time-entry-table-values-row"
    className={css({
      td: {
        fontSize: 14,
        fontWeight: 400,
        paddingBottom: isBottomPadded ? 4 : undefined,
      },
    })}
  >
    {children}
  </tr>
);

export default ValuesRow;
