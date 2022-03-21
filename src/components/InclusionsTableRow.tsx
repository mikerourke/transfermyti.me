import React from "react";

interface Props extends React.HTMLProps<HTMLTableRowElement> {
  disabled?: boolean;
}

const InclusionsTableRow: React.FC<Props> = ({ disabled, ...props }) => (
  <tr data-disabled={disabled} {...props} />
);

export default InclusionsTableRow;
