import React from "react";
import { BaseEntityModel, TableViewModel } from "~/typeDefs";

interface Props extends React.HTMLProps<HTMLTableCellElement> {
  entityRecord: TableViewModel<BaseEntityModel>;
  onFlipIsIncluded: (id: string) => void;
}

const InclusionsTableCheckboxCell: React.FC<Props> = ({
  entityRecord,
  onFlipIsIncluded,
  ...props
}) => {
  const handleInputChange = (): void => {
    onFlipIsIncluded(entityRecord.id);
  };

  return (
    <td data-include={true} {...props}>
      <input
        type="checkbox"
        checked={entityRecord.existsInTarget ? false : entityRecord.isIncluded}
        disabled={entityRecord.existsInTarget}
        onChange={handleInputChange}
      />
    </td>
  );
};

export default InclusionsTableCheckboxCell;
