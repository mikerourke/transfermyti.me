import React from "react";

interface Props extends React.HTMLProps<HTMLTableRowElement> {
  disabled?: boolean;
}

const InclusionsTableRow: React.FC<Props> = ({ disabled, ...props }) => (
  <tr
    css={(theme) => ({
      td: {
        color: disabled ? theme.colors.manatee : theme.colors.midnight,
        textDecoration: disabled ? "line-through" : "none",
      },
    })}
    {...props}
  />
);

export default InclusionsTableRow;
