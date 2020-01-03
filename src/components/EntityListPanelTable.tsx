import { styled } from "./emotion";

export const EntityListPanelTable = styled.table(
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
    ".include-cell": {
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

    "caption, th, tfoot td": {
      fontWeight: theme.fontWeights.bold,
    },
  }),
);

export const EntityListPanelTableRow = styled.tr<{
  existsInTarget: boolean;
}>({}, ({ existsInTarget, theme }) => ({
  td: {
    color: existsInTarget ? theme.colors.manatee : theme.colors.midnight,
    textDecoration: existsInTarget ? "line-through" : "none",
  },
}));
