import React from "react";

interface Props {
  hasTopBorder: boolean;
}

const HeadersRow: React.FC<Props> = ({ children, hasTopBorder }) => (
  <tr
    data-testid="time-entry-table-headers-row"
    css={{
      borderTop: hasTopBorder ? "1px solid rgba(10, 10, 10, 0.1)" : undefined,

      td: {
        color: "var(--info)",
        fontSize: 12,
        fontWeight: 700,
        textTransform: "uppercase",
        paddingTop: hasTopBorder ? 4 : undefined,
      },
    }}
  >
    {children}
  </tr>
);

export default HeadersRow;
