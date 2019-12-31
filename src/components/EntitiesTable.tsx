import React from "react";
import { connect } from "react-redux";
import { booleanToYesNo, capitalize, kebabCase } from "~/utils";
import { toolNameByMappingSelector } from "~/app/appSelectors";
import { ToolNameByMappingModel } from "~/app/appTypes";
import { styled } from "~/components/emotion";
import {
  BaseEntityModel,
  TableViewModel,
} from "~/allEntities/allEntitiesTypes";
import { ReduxState } from "~/redux/reduxTypes";

const Root = styled.div({
  overflowY: "auto",
  position: "relative",
  width: "100%",
});

const Table = styled.table({
  tableLayout: "fixed",
  width: "100%",

  th: {
    fontWeight: "bold",
    textAlign: "left",
  },

  td: {
    borderTop: "1px solid rgb(229, 229, 234);",
    padding: "0.5rem 0.25rem",
  },

  "tr th, tr td": {
    fontSize: "0.875rem",
  },

  "tr th:first-of-type, tr td:first-of-type": {
    textAlign: "center",
    width: "5rem",
  },
});

const TableBodyRow = styled.tr<{ existsInTarget: boolean }>(
  {},
  ({ existsInTarget, theme }) => ({
    td: {
      color: existsInTarget ? theme.colors.manatee : theme.colors.black,
      textDecoration: existsInTarget ? "line-through" : "none",
    },
  }),
);

interface TableField {
  label: string;
  field: string;
}

interface ConnectStateProps {
  toolNameByMapping: ToolNameByMappingModel;
}

interface OwnProps {
  tableData: TableViewModel<BaseEntityModel>[];
  tableFields: TableField[];
  onFlipIsIncluded: (id: string) => void;
}

type Props = ConnectStateProps & OwnProps;

const EntitiesTable: React.FC<Props> = ({
  children,
  tableData,
  tableFields,
  toolNameByMapping,
  onFlipIsIncluded,
  ...props
}) => {
  const getFieldDisplay = (value: string | boolean): string => {
    if (typeof value === "boolean") {
      return booleanToYesNo(value);
    }

    return value;
  };

  const getLabelDisplay = (label: string): string => {
    const { source, target } = toolNameByMapping;
    if (/Source/g.test(label)) {
      return label.replace("Source", capitalize(source));
    }

    if (/Target/g.test(label)) {
      return label.replace("Target", capitalize(target));
    }

    return label;
  };

  return (
    <Root>
      <Table {...props}>
        <thead>
          <tr>
            <th>Include?</th>
            {tableFields.map(({ label }) => (
              <th key={kebabCase(label)}>{getLabelDisplay(label)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.map(record => (
            <TableBodyRow
              key={record.id}
              existsInTarget={record.existsInTarget}
            >
              <td>
                <input
                  type="checkbox"
                  checked={record.existsInTarget ? false : record.isIncluded}
                  disabled={record.existsInTarget}
                  onChange={() => onFlipIsIncluded(record.id)}
                />
              </td>
              {tableFields.map(({ field }) => (
                <td key={`${record.id}-${field}`}>
                  {getFieldDisplay(record[field])}
                </td>
              ))}
            </TableBodyRow>
          ))}
        </tbody>
      </Table>
    </Root>
  );
};

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  toolNameByMapping: toolNameByMappingSelector(state),
});

export default connect<ConnectStateProps, {}, OwnProps, ReduxState>(
  mapStateToProps,
)(EntitiesTable);
