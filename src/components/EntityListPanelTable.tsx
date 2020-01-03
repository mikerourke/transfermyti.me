import React from "react";
import { styled } from "./emotion";

const Table = styled.table(
  {
    borderSpacing: 0,
    tableLayout: "fixed",
    width: "100%",

    "td, th": {
      fontSize: "0.875rem",
      padding: "0.5rem",
    },

    "caption, th, tfoot td": {
      fontWeight: "bold",
    },

    "thead th, td": {
      textAlign: "left",
    },

    "thead tr:first-of-type th": {
      borderTop: "none",
    },

    // Include header and value cells:
    ".include-cell": {
      borderRight: "none",
      textAlign: "center",
      width: "5.25rem",
    },

    "tfoot td:last-of-type": {
      borderRight: "none",
    },
  },
  ({ theme }) => ({
    border: `1px solid ${theme.colors.alto}`,

    "th, tfoot td": {
      background: theme.colors.white,
    },

    "th, td": {
      borderRight: `1px solid ${theme.colors.alto}`,
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

class EntityListPanelTable extends React.Component {
  public static BodyRow = BodyRow;

  public render(): JSX.Element {
    return <Table {...this.props} />;
  }
}

export default EntityListPanelTable;
