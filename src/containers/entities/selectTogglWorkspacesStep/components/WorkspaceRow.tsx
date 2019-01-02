import React from 'react';
import reverse from 'lodash/reverse';
import { css } from 'emotion';
import { Box } from 'bloomer';
import IncludedIndicator from '../../../../components/includedIndicator/IncludedIndicator';
import { WorkspaceModel } from '../../../../types/workspacesTypes';

interface Props {
  workspaceRecord: WorkspaceModel;
  onWorkspaceClick: (workspaceId: string) => void;
  onYearClick: (workspaceId: string, year: string) => void;
}

const WorkspaceRow: React.FunctionComponent<Props> = ({
  workspaceRecord: { id, name, isIncluded, inclusionsByYear },
  onWorkspaceClick,
  onYearClick,
}) => (
  <Box
    className={css`
      font-weight: bold;
    `}
  >
    <div
      className={css`
        align-items: center;
        display: flex;
      `}
    >
      <IncludedIndicator
        isIncluded={isIncluded}
        size="1.5rem"
        onClick={() => onWorkspaceClick(id)}
      />
      <span
        className={css`
          margin-left: 0.75rem;
          font-size: 1.5rem;
        `}
      >
        {name}
      </span>
    </div>
    <div>
      {reverse(Object.keys(inclusionsByYear).sort()).map(year => (
        <div
          key={`${id}-${year}`}
          className={css`
            display: flex;
            align-items: center;
            margin: 0.5rem 0 0.5rem 2.5rem;
          `}
        >
          <IncludedIndicator
            isIncluded={inclusionsByYear[year]}
            size="1.25rem"
            onClick={() => onYearClick(id, year)}
          />
          <span
            className={css`
              font-size: 1.25rem;
              margin-left: 0.5rem;
            `}
          >
            {year}
          </span>
        </div>
      ))}
    </div>
  </Box>
);

export default WorkspaceRow;
