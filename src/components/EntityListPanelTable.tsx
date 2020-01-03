import { styled } from "./emotion";

export const EntityListPanelTable = styled.table(
  {
    borderSpacing: 0,
    tableLayout: "fixed",
    width: "100%",

    "td, th": {
      fontSize: "0.875rem",
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

    "caption, th, tfoot td": {
      fontWeight: theme.fontWeights.bold,
    },
  }),
);

export const EntityListPanelTableRow = styled.tr<{
  existsInTarget: boolean;
}>({}, ({ existsInTarget, theme }) => ({
  td: {
    color: existsInTarget ? theme.colors.manatee : theme.colors.black,
    textDecoration: existsInTarget ? "line-through" : "none",
  },
}));
