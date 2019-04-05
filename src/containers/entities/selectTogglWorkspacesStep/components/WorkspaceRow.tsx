import React from 'react';
import { Box } from 'bloomer';
import { css } from 'emotion';
import { reverse } from 'lodash';
import Flex from '~/components/flex/Flex';
import Checkbox from '~/components/checkbox/Checkbox';
import { WorkspaceModel } from '~/types/workspacesTypes';
import { CheckedState } from '~/types/commonTypes';

interface Props {
  workspaceRecord: WorkspaceModel;
  onWorkspaceClick: (workspaceId: string) => void;
  onYearClick: (workspaceId: string, year: string) => void;
}

const getWorkspaceCheckedState = (
  inclusionsByYear: Record<string, boolean>,
) => {
  const { includeCount, exemptCount } = Object.values(inclusionsByYear).reduce(
    (acc, isIncluded) => ({
      includeCount: isIncluded ? acc.includeCount + 1 : acc.includeCount,
      exemptCount: isIncluded ? acc.exemptCount : acc.exemptCount + 1,
    }),
    { includeCount: 0, exemptCount: 0 },
  );

  if (exemptCount === 0) return CheckedState.Checked;
  if (includeCount > 0 && exemptCount > 0) return CheckedState.Indeterminate;
  return CheckedState.Unchecked;
};

const WorkspaceRow: React.FC<Props> = ({
  workspaceRecord: { id, name, isIncluded, inclusionsByYear },
  onWorkspaceClick,
  onYearClick,
}) => (
  <Box
    className={css`
      font-weight: bold;
    `}
  >
    <Flex alignItems="center">
      <Checkbox
        checked={getWorkspaceCheckedState(inclusionsByYear)}
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
    </Flex>
    <div>
      {reverse(Object.keys(inclusionsByYear).sort()).map(year => (
        <Flex
          key={`${id}-${year}`}
          alignItems="center"
          className={css`
            margin: 0.5rem 0 0.5rem 2.5rem;
          `}
        >
          <Checkbox
            checked={inclusionsByYear[year]}
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
        </Flex>
      ))}
    </div>
  </Box>
);

export default WorkspaceRow;
