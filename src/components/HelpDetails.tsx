import React from "react";
import { styled } from "./emotion";

const Details = styled.details(
  {
    borderRadius: "0.25rem",
    marginBottom: "1rem",
    width: "100%",

    "p,summary": {
      margin: 0,
      padding: "0.5rem 0.25rem",
    },
  },
  ({ theme }) => ({
    color: theme.colors.midnight,
  }),
);

const HelpDetails: React.FC = ({ children, ...props }) => (
  <Details {...props}>
    <summary>Show/Hide Help</summary>
    <p>{children}</p>
  </Details>
);

export default HelpDetails;
