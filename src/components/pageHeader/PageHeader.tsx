import React from "react";
import { css } from "emotion";

interface Props {
  title: string;
  subtitle: string;
}

const PageHeader: React.FC<Props> = ({ title, subtitle }) => (
  <>
    <h1
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
