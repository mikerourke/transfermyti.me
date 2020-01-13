import React from "react";
import { PayloadActionCreator } from "typesafe-actions";
import { booleanToYesNo } from "~/utils";
import InclusionsTableCheckboxCell from "./InclusionsTableCheckboxCell";
import InclusionsTableRow from "./InclusionsTableRow";
import { BaseEntityModel, TableViewModel } from "~/typeDefs";

interface Props {
  fieldNames: string[];
  tableData: TableViewModel<BaseEntityModel>[];
  onFlipIsIncluded: PayloadActionCreator<string, string>;
}

const InclusionsTableBody: React.FC<Props> = ({
  fieldNames,
  tableData,
  onFlipIsIncluded,
  ...props
}) => (
  <tbody {...props}>
    {tableData.map(record => (
      <InclusionsTableRow key={record.id} disabled={record.existsInTarget}>
        {fieldNames.map(fieldName => (
          <td key={`${record.id}-${fieldName}`}>
            {booleanToYesNo(record[fieldName])}
          </td>
        ))}
        <InclusionsTableCheckboxCell
          entityRecord={record}
          onFlipIsIncluded={onFlipIsIncluded}
        />
      </InclusionsTableRow>
    ))}
  </tbody>
);

export default InclusionsTableBody;
