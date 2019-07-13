import React from "react";
import { Unless } from "react-if";
import { startCase } from "lodash";
import { css } from "emotion";
import { lookupTable } from "~/utils/lookupTable";
import Checkbox from "~/components/checkbox/Checkbox";
import Flex from "~/components/flex/Flex";
import GroupTotalsDisplay from "./GroupTotalsDisplay";
import { EntityGroup } from "~/types/entityTypes";
import { RecordCountsModel } from "~/types/workspacesTypes";

interface Props {
  activeEntityGroup: EntityGroup;
  groupRecordCounts: RecordCountsModel;
  showInclusionsOnly: boolean;
  onFlipInclusionsOnly: () => void;
}

const PageFooter: React.FC<Props> = ({
  activeEntityGroup,
  groupRecordCounts,
  showInclusionsOnly,
  onFlipInclusionsOnly,
}) => {
  // const isTimeEntriesActive = activeEntityGroup === EntityGroup.TimeEntries;
  // TODO: Re-enable this once you finish implementing the time entry duplication check.
  const isTimeEntriesActive = true;

  const timeEntriesLabel = lookupTable(activeEntityGroup, {
    [EntityGroup.Clients]: "Time Entries With A Client",
    [EntityGroup.Tags]: "Time Entries With Tags",
    default: "Time Entries To Transfer",
  });

  return (
    <Flex
      alignItems="center"
      justifyContent="space-between"
      className={css`
        border-top: 1px solid #dbdbdb;
        color: var(--dark-gray);
        margin-top: 1rem;
        padding-top: 0.5rem;
      `}
    >
      <Flex>
        <GroupTotalsDisplay
          label={`${startCase(activeEntityGroup)} to Transfer`}
          included={groupRecordCounts.includedRecordCount}
          total={groupRecordCounts.totalRecordCount}
        />
        <Unless condition={isTimeEntriesActive}>
          <GroupTotalsDisplay
            label={timeEntriesLabel}
            included={groupRecordCounts.includedEntryCount}
            total={groupRecordCounts.totalEntryCount}
          />
        </Unless>
      </Flex>
      <Flex alignItems="center">
        <Checkbox
          checked={showInclusionsOnly}
          size={18}
          onClick={onFlipInclusionsOnly}
        />
        <span
          className={css`
            margin-left: 0.5em;
            font-weight: bold;
          `}
        >
          Show Included Records Only
        </span>
      </Flex>
    </Flex>
  );
};

export default PageFooter;
