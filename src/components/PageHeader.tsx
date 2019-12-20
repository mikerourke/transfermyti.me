import React from "react";
import { css } from "emotion";

interface Props {
  title: string;
  subtitle: string;
}

const PageHeader: React.FC<Props> = ({ title, subtitle }) => (
  <>
    <h1
      data-testid="page-header-title"
      className={css({
        marginBottom: 0,
        fontSize: "1.5rem",
        color: "var(--dark-gray)",
        fontWeight: 600,
        lineHeight: 1.125,
      })}
    >
      {title}
    </h1>
    <h2
      data-testid="page-header-subtitle"
      className={css({
        marginBottom: "0.5rem",
        fontSize: "2rem",
        fontWeight: 400,
        color: "var(--dark-gray)",
      })}
    >
      {subtitle}
    </h2>
  </>
);

export default PageHeader;
