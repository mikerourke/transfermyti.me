import React from "react";
import { styled } from "./emotion";

const Table = styled.table(
  {
    borderSpacing: 0,
    tableLayout: "fixed",
    width: "100%",

    "td, th": {
      padding: "0.5rem",
    },

    "thead th, td": {
      textAlign: "left",
    },

    "thead tr:first-of-type th": {
      borderTop: "none",
    },

    // Include header and value cells:
    "[data-include='true']": {
      borderRight: "none",
      textAlign: "center",
      width: "6rem",
    },

    "tfoot td:last-of-type": {
      borderRight: "none",
    },

    "tbody tr:first-of-type td": {
      borderTop: "none",
    },
  },
  ({ theme }) => ({
    border: `1px solid ${theme.colors.primary}`,

    "th, tfoot td": {
      background: theme.colors.primary,
      borderRight: `1px solid ${theme.colors.white}`,
      color: theme.colors.white,
      fontWeight: theme.fontWeights.bold,
    },

    "thead th": {
      borderBottom: `1px solid ${theme.colors.white}`,
    },

    "tbody td": {
      background: theme.colors.white,
      borderRight: `1px solid ${theme.colors.primary}`,
      borderTop: `1px solid ${theme.colors.primary}`,
    },

    "tbody tr:last-of-type td": {
      borderBottom: `1px solid ${theme.colors.white}`,
    },
  }),
);

const InclusionsTable: React.FC = props => <Table role="grid" {...props} />;

export default InclusionsTable;
