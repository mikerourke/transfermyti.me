import React from "react";

import { styled } from "~/components";
import { EntityGroup } from "~/modules/allEntities/allEntitiesTypes";
import { getEntityGroupDisplay } from "~/utilities/textTransforms";

const StyledDiv = styled.div`
  margin-bottom: 1rem;
  margin-top: 0.5rem;

  h2 {
    font-size: 1.25rem;
    font-weight: var(--font-weight-body);
    margin: 0 0 0.5rem 0.5rem;
  }

  [role="progressbar"] {
    position: relative;
    height: 1.5rem;
    width: 100%;
    border-radius: 3rem;
    background-color: var(--color-white);
    box-shadow: var(--elevation-dp2);
  }

  span {
    display: block;
    height: 100%;
    border-radius: inherit;
    background-color: var(--color-green);
    box-shadow: var(--elevation-dp2);
    transition: width 0.5s ease-in;
  }

  h3 {
    font-size: 1.125rem;
    margin: 0.5rem 0 0 0.75rem;
  }
`;

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  completedCount: number;
  totalCount: number;
  entityGroup: EntityGroup;
}

const ProgressBar: React.FC<Props> = ({
  completedCount,
  totalCount,
  entityGroup,
  ...props
}) => {
  if (totalCount === 0) {
    return null;
  }

  let percentage = (completedCount / totalCount) * 100;
  if (Number.isNaN(percentage)) {
    percentage = 0;
  }
  return (
    <StyledDiv {...props}>
      <h2 id={`${entityGroup}-progress`}>
        {getEntityGroupDisplay(entityGroup)}
      </h2>

      <div
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-labelledby={`${entityGroup}-progress`}
      >
        <span
          data-testid="progress-bar-filler"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <h3>
        {completedCount} / {totalCount}
      </h3>
    </StyledDiv>
  );
};

export default ProgressBar;
