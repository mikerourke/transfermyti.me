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
  const totalsByTypeEntries = Object.entries(totalCountsByType);
  const totalsColSpan = fieldCount + 1 - totalsByTypeEntries.length;
  const totalLabel = totalsByTypeEntries.length === 1 ? "Total" : "Totals";

  return (
    <tfoot css={{ "td:last-of-type": { textAlign: "center" } }} {...props}>
      <tr>
        <th css={{ textAlign: "right" }} colSpan={totalsColSpan}>
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
