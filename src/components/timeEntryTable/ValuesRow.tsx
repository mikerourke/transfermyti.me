import React from "react";

interface Props {
  isBottomPadded: boolean;
}

const ValuesRow: React.FC<Props> = ({ isBottomPadded, ...props }) => (
  <tr
    data-testid="time-entry-table-values-row"
    css={{
      td: {
        fontSize: 14,
        fontWeight: 400,
        paddingBottom: isBottomPadded ? 4 : undefined,
      },
    }}
    {...props}
  />
);

export default ValuesRow;
