import React from "react";
import { EntityGroup } from "~/allEntities/allEntitiesTypes";
import { styled } from "./emotion";

const Table = styled.table(
  {
    borderSpacing: 0,
    tableLayout: "fixed",
    width: "100%",

    "th, tfoot td": {
      fontWeight: "bold",
    },

    "th, td": {
      fontSize: "0.875rem",
      padding: "0.5rem",
      textAlign: "left",
    },

    "tr:first-of-type th": {
      borderTop: "none",
    },

    // Include header and value cells:
    ".include-cell, tfoot td": {
      borderLeft: "none",
      textAlign: "center",
      width: "5.25rem",
    },

    tfoot: {
      input: {
        marginRight: "0.5rem",
      },

      td: {
        textAlign: "left",
      },
    },
  },
  ({ theme }) => ({
    border: `1px solid ${theme.colors.alto}`,

    "th, tfoot td": {
      background: theme.colors.white,
    },

    "th, td": {
      borderLeft: `1px solid ${theme.colors.alto}`,
      borderTop: `1px solid ${theme.colors.alto}`,
    },
  }),
);

const BodyRow = styled.tr<{
  existsInTarget: boolean;
}>({}, ({ existsInTarget, theme }) => ({
  td: {
    color: existsInTarget ? theme.colors.manatee : theme.colors.black,
    textDecoration: existsInTarget ? "line-through" : "none",
  },
}));

const Footer: React.FC<{
  columnCount: number;
  entityGroup: EntityGroup;
  isShowExisting: boolean;
  onToggle: VoidFunction;
}> = ({ columnCount, entityGroup, isShowExisting, onToggle }) => (
  <tfoot>
    <tr>
      <td colSpan={columnCount}>
        <input
          id={`${entityGroup}-show`}
          name={`${entityGroup}-show`}
          type="checkbox"
          checked={isShowExisting}
          onChange={onToggle}
        />
        <label htmlFor={`${entityGroup}-show`}>Show Existing</label>
      </td>
    </tr>
  </tfoot>
);

class EntityListPanelTable extends React.Component {
  public static BodyRow = BodyRow;
  public static Footer = Footer;

  public render(): JSX.Element {
    return <Table {...this.props} />;
  }
}

export default EntityListPanelTable;
