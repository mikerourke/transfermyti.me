import React from "react";
import { startCase } from "lodash";
import { Columns } from "bloomer";
import styled from "@emotion/styled";
import ProgressIndicatorColumn from "./ProgressIndicatorColumn";
import {
  AggregateTransferCountsModel,
  InTransferDetailsModel,
  TransferCountsModel,
} from "~/app/appTypes";

const ProgressIndicatorColumns = styled(Columns)({
  ".box": {
    paddingBottom: "1.5rem",
  },

  ".heading": {
    marginTop: "1rem",
    fontSize: 16,
    fontWeight: "bold",
  },

  strong: {
    color: "var(--info)",
  },
});

interface Props {
  inTransferDetails: InTransferDetailsModel;
  workspaceName: string;
  aggregateTransferCounts: AggregateTransferCountsModel;
  workspaceTransferCounts: TransferCountsModel;
}

const ProgressIndicators: React.FC<Props> = props => {
  const { countCurrentInGroup, countTotalInGroup } = props.inTransferDetails;
  const {
    countCurrentInWorkspace,
    countTotalInWorkspace,
    countCurrentOverall,
    countTotalOverall,
  } = props.aggregateTransferCounts;
  const { countCurrent, countTotal } = props.workspaceTransferCounts;

  return (
    <div css={{ width: "100%" }}>
      <ProgressIndicatorColumns isCentered>
        <ProgressIndicatorColumn
          title="Overall Progress"
          subtitle={`Workspace ${countCurrent} of ${countTotal}`}
          countCurrent={countCurrentOverall}
          countTotal={countTotalOverall}
        />
        <ProgressIndicatorColumn
          title="Workspace Progress"
          subtitle={props.workspaceName}
          countCurrent={countCurrentInWorkspace}
          countTotal={countTotalInWorkspace}
        />
        <ProgressIndicatorColumn
          title="Group Progress"
          subtitle={startCase(props.inTransferDetails.entityGroup || "none")}
          countCurrent={countCurrentInGroup}
          countTotal={countTotalInGroup}
        />
      </ProgressIndicatorColumns>
    </div>
  );
};

export default ProgressIndicators;
