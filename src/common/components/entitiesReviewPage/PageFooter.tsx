import React from "react";
import { Unless } from "react-if";
import { startCase } from "lodash";
import { css } from "emotion";
import { lookupTable } from "~/utils/lookupTable";
import Checkbox from "../Checkbox";
import Flex from "../Flex";
import GroupTotalsDisplay from "./GroupTotalsDisplay";
import { EntityGroup } from "~/common/commonTypes";
import { RecordCountsModel } from "~/workspaces/workspacesTypes";

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
      className={css({
        borderTop: "1px solid #dbdbdb",
        color: "var(--dark-gray)",
        marginTop: "1rem",
        paddingTop: "0.5rem",
      })}
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
        <span className={css({ marginLeft: "0.5rem", fontWeight: "bold" })}>
          Show Included Records Only
        </span>
      </Flex>
    </Flex>
  );
};

export default PageFooter;
