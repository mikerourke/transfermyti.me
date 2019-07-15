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
      className={css`
        margin-bottom: 0;
        font-size: 1.5rem;
        color: var(--dark-gray);
        font-weight: 600;
        line-height: 1.125;
      `}
    >
      {title}
    </h1>
    <h2
      data-testid="page-header-subtitle"
      className={css`
        margin-bottom: 0.5rem;
        font-size: 2rem;
        font-weight: 400;
        color: var(--dark-gray);
      `}
    >
      {subtitle}
    </h2>
  </>
);

export default PageHeader;
