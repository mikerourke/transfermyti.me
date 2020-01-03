import React from "react";
import { connect } from "react-redux";
import { booleanToYesNo, getEntityGroupDisplay, kebabCase } from "~/utils";
import {
  toolNameByMappingSelector,
  replaceMappingWithToolNameSelector,
} from "~/app/appSelectors";
import EntityListPanelTable from "./EntityListPanelTable";
import { AccordionPanel } from "./Accordion";
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
  replaceMappingWithToolName: (label: string) => string;
  toolNameByMapping: ToolNameByMappingModel;
}

interface OwnProps {
  entityGroup: EntityGroup;
  rowNumber: number;
  tableData: TableViewModel<BaseEntityModel>[];
  tableFields: TableField[];
  totalCountsByType: Record<string, number>;
  onFlipIsIncluded: (id: string) => void;
}

type Props = ConnectStateProps & OwnProps;

export const EntityListPanelComponent: React.FC<Props> = props => {
  const groupDisplay = getEntityGroupDisplay(props.entityGroup);

  const getFieldDisplay = (value: string | boolean): string => {
    if (typeof value === "boolean") {
      return booleanToYesNo(value);
    }

    return value;
  };

  const totalCountsByTypeEntries = Object.entries(props.totalCountsByType);
  const totalsColSpan =
    props.tableFields.length + 1 - totalCountsByTypeEntries.length;

  return (
    <AccordionPanel rowNumber={props.rowNumber} title={groupDisplay}>
      <EntityListPanelTable>
        <caption>
          {props.replaceMappingWithToolName(
            `${groupDisplay} Records in Source`,
          )}
        </caption>
        <thead>
          <tr>
            {props.tableFields.map(({ label }) => (
              <th key={kebabCase(label)}>
                {props.replaceMappingWithToolName(label)}
              </th>
            ))}
            <th className="include-cell">Include in Transfer?</th>
          </tr>
        </thead>
        <tbody>
          {props.tableData.map(record => (
            <EntityListPanelTable.BodyRow
              key={record.id}
              existsInTarget={record.existsInTarget}
            >
              {props.tableFields.map(({ field }) => (
                <td key={`${record.id}-${field}`}>
                  {getFieldDisplay(record[field])}
                </td>
              ))}
              <td className="include-cell">
                <input
                  type="checkbox"
                  checked={record.existsInTarget ? false : record.isIncluded}
                  disabled={record.existsInTarget}
                  onChange={() => props.onFlipIsIncluded(record.id)}
                />
              </td>
            </EntityListPanelTable.BodyRow>
          ))}
        </tbody>
        <tfoot css={{ "td:last-of-type": { textAlign: "center" } }}>
          <tr>
            <th css={{ textAlign: "right" }} colSpan={totalsColSpan}>
              Totals
            </th>
            {totalCountsByTypeEntries.map(([type, totalCount]) => (
              <td key={type}>{totalCount}</td>
            ))}
          </tr>
        </tfoot>
      </EntityListPanelTable>
    </AccordionPanel>
  );
};

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  replaceMappingWithToolName: replaceMappingWithToolNameSelector(state),
  toolNameByMapping: toolNameByMappingSelector(state),
});

export default connect<ConnectStateProps, {}, OwnProps, ReduxState>(
  mapStateToProps,
)(EntityListPanelComponent);
