import React from "react";

interface Props {
  fieldCount: number;
  totalCountsByType: Record<string, number>;
}

const InclusionsTableFoot: React.FC<Props> = ({
  fieldCount,
  totalCountsByType,
  ...props
}) => {
  const { existsInTarget, ...validCountsByType } = totalCountsByType;
  const totalsByTypeEntries = Object.entries(validCountsByType);
  const totalsColSpan = fieldCount + 1 - totalsByTypeEntries.length;
  const totalLabel = totalsByTypeEntries.length === 1 ? "Total" : "Totals";

  return (
    <tfoot {...props}>
      <tr>
        <th style={{ textAlign: "right" }} colSpan={totalsColSpan}>
          {totalLabel}
        </th>

        {totalsByTypeEntries.map(([type, totalCount]) => (
          <td key={type}>{totalCount}</td>
        ))}
      </tr>
    </tfoot>
  );
};

export default InclusionsTableFoot;
