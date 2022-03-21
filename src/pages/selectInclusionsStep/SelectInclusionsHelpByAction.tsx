import React from "react";

import { HelpDetails } from "~/components";
import { ToolAction } from "~/typeDefs";

const SelectInclusionsHelpForDelete: React.FC = () => (
  <HelpDetails>
    <p>
      Review the records you&apos;d like to delete. Change the active workspace
      by selecting it from the <strong>Active Workspace</strong> dropdown.
    </p>

    <p>
      Pressing the <strong>Include All/None</strong> button in the header above
      each table will select or deselect all of the corresponding records to be
      deleted. The footer in each table contains the totals associated with the
      corresponding column.
    </p>

    <p>
      Press the <strong>Next</strong> button when you&apos;re ready to delete
      the records you selected.
      <span className="note" style={{ marginLeft: "0.375rem" }}>
        The deletion process will not start until you confirm it on the next
        page.
      </span>
    </p>
  </HelpDetails>
);

const SelectInclusionsHelpForTransfer: React.FC = () => (
  <HelpDetails>
    <p>
      Review the records you&apos;d like to include in the transfer. If the
      record already exists on the target tool, the option to include it is
      disabled.
    </p>

    <p>
      Change the active workspace by selecting it from the
      <strong> Active Workspace</strong> dropdown. Toggling
      <strong> Show records that already exist in target? </strong>
      will either show or hide the records that already exist in the target
      tool. This is useful if you only wish to see the records that
      <i> can</i> be transferred to the target tool.
    </p>

    <p>
      Pressing the <strong>Include All/None</strong> button in the header above
      each table will select or deselect all of the corresponding records to be
      included in the transfer. If all of the records in the group already
      exist, the button will be disabled. The footer in each table contains the
      totals associated with the corresponding column.
    </p>

    <p>
      Press the <strong>Next</strong> button when you&apos;re ready to begin the
      transfer.
      <span className="note" style={{ marginLeft: "0.375rem" }}>
        The transfer will not start until you confirm it on the next page.
      </span>
    </p>
  </HelpDetails>
);

interface Props {
  toolAction: ToolAction;
}

const SelectInclusionsHelpByAction: React.FC<Props> = (props) => {
  switch (props.toolAction) {
    case ToolAction.Delete:
      return <SelectInclusionsHelpForDelete />;

    case ToolAction.Transfer:
      return <SelectInclusionsHelpForTransfer />;

    default:
      return null;
  }
};

export default SelectInclusionsHelpByAction;
