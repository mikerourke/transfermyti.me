import React from "react";
import { styled } from "./emotion";

const Base = styled.li(
  {
    borderRadius: "0.5rem",
    display: "flex",
    flex: "0 0 20rem",
    flexDirection: "column",
    margin: "0 1rem 2rem",
    padding: "1rem",
  },
  ({ theme }) => ({
    background: theme.colors.primary,
    boxShadow: theme.elevation.dp4,
    color: theme.colors.secondary,

    [theme.query.mobile]: {
      flexBasis: "16rem",
    },
  }),
);

interface Props {
  title: React.ReactNode;
}

const Card: React.FC<Props> = ({ children, title, ...props }) => (
  <Base {...props}>
    <h2>{title}</h2>
    {children}
  </Base>
);

export default Card;
