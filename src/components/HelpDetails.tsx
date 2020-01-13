import React from "react";
import { styled } from "./emotion";

const Details = styled.details(
  {
    marginBottom: "1rem",
    width: "100%",

    "div,summary": {
      margin: 0,
      padding: "0.5rem 0.25rem",
    },

    p: {
      "&:not(first-of-type)": {
        marginTop: 0,
      },

      "&:last-of-type": {
        marginBottom: 0,
      },
    },
  },
  ({ theme }) => ({
    color: theme.colors.primary,
  }),
);

interface Props extends React.HTMLProps<HTMLDetailsElement> {
  title?: string;
}

const HelpDetails: React.FC<Props> = ({
  children,
  title = "Show/Hide Help",
  ...props
}) => (
  <Details {...props}>
    <summary css={theme => ({ fontWeight: theme.fontWeights.bold })}>
      {title}
    </summary>
    <div>{children}</div>
    <hr />
  </Details>
);

export default HelpDetails;
