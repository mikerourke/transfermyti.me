import React from "react";
import { connect } from "react-redux";
import { kebabCase, booleanToYesNo, capitalize } from "~/utils";
import { toolNameByMappingSelector } from "~/app/appSelectors";
import { AccordionPanel } from "./Accordion";
import EntityListPanelTable from "./EntityListPanelTable";
import EntityListPanelTitle from "./EntityListPanelTitle";
import {
  BaseEntityModel,
  EntityGroup,
  TableViewModel,
} from "~/allEntities/allEntitiesTypes";
import { ToolNameByMappingModel } from "~/app/appTypes";
import { ReduxState } from "~/redux/reduxTypes";

interface TableField {
  label: string;
  field: string;
}

interface ConnectStateProps {
  toolNameByMapping: ToolNameByMappingModel;
}

interface OwnProps {
  entityGroup: EntityGroup;
  rowNumber: number;
  tableData: TableViewModel<BaseEntityModel>[];
  tableFields: TableField[];
  onFlipIsIncluded: (id: string) => void;
}

type Props = ConnectStateProps & OwnProps;

export const EntityListPanelComponent: React.FC<Props> = props => {
  const [showExisting, setShowExisting] = React.useState<boolean>(true);

  const groupName =
    props.entityGroup === EntityGroup.UserGroups
      ? "User Groups"
      : capitalize(props.entityGroup);

  const getFieldDisplay = (value: string | boolean): string => {
    if (typeof value === "boolean") {
      return booleanToYesNo(value);
    }

    return value;
  };

  const getLabelDisplay = (label: string): string => {
    const { source, target } = props.toolNameByMapping;
    if (/Source/g.test(label)) {
      return label.replace("Source", capitalize(source));
    }

    if (/Target/g.test(label)) {
      return label.replace("Target", capitalize(target));
    }

    return label;
  };

  const visibleTableData = showExisting
    ? props.tableData
    : props.tableData.filter(record => !record.existsInTarget);

  return (
    <AccordionPanel
      rowNumber={props.rowNumber}
      title={
        <EntityListPanelTitle
          groupName={groupName}
          entityCount={visibleTableData.length}
        />
      }
    >
      <EntityListPanelTable>
        <thead>
          <tr>
            <th className="include-cell">Include in Transfer?</th>
            {props.tableFields.map(({ label }) => (
              <th key={kebabCase(label)}>{getLabelDisplay(label)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visibleTableData.map(record => (
            <EntityListPanelTable.BodyRow
              key={record.id}
              existsInTarget={record.existsInTarget}
            >
              <td className="include-cell">
                <input
                  type="checkbox"
                  checked={record.existsInTarget ? false : record.isIncluded}
                  disabled={record.existsInTarget}
                  onChange={() => props.onFlipIsIncluded(record.id)}
                />
              </td>
              {props.tableFields.map(({ field }) => (
                <td key={`${record.id}-${field}`}>
                  {getFieldDisplay(record[field])}
                </td>
              ))}
            </EntityListPanelTable.BodyRow>
          ))}
        </tbody>
        <EntityListPanelTable.Footer
          columnCount={props.tableFields.length + 1}
          entityGroup={props.entityGroup}
          isShowExisting={showExisting}
          onToggle={() => setShowExisting(!showExisting)}
        />
      </EntityListPanelTable>
    </AccordionPanel>
  );
};

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  toolNameByMapping: toolNameByMappingSelector(state),
});

export default connect<ConnectStateProps, {}, OwnProps, ReduxState>(
  mapStateToProps,
)(EntityListPanelComponent);
