import React from "react";
import { styled } from "./emotion";

const Details = styled.details(
  {
    borderRadius: "0.25rem",
    marginBottom: "1rem",
    width: "100%",

    "div,summary": {
      margin: 0,
      padding: "0.5rem 0.25rem",
    },

    p: {
      margin: 0,
      padding: "1rem 0 0 0",

      "&:first-of-type": {
        paddingTop: 0,
      },
    },
  },
  ({ theme }) => ({
    color: theme.colors.primary,
  }),
);

const HelpDetails: React.FC = ({ children, ...props }) => (
  <Details {...props}>
    <summary css={theme => ({ fontWeight: theme.fontWeights.bold })}>
      Show/Hide Help
    </summary>
    <div>{children}</div>
  </Details>
);

export default HelpDetails;
