import React from 'react';
import { css } from 'emotion';
import { startCase } from 'lodash';
import { Columns } from 'bloomer';
import ProgressIndicatorColumn from './ProgressIndicatorColumn';
import {
  AggregateTransferCountsModel,
  InTransferDetailsModel,
  TransferCountsModel,
} from '~/types';

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
    <div
      className={css`
        width: 100%;
      `}
    >
      <Columns
        isCentered
        className={css`
          .box {
            padding-bottom: 1.5rem;
          }

          .heading {
            margin-top: 1rem;
            font-size: 16px;
            font-weight: bold;
          }

          strong {
            color: var(--info);
          }
        `}
      >
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
          subtitle={startCase(props.inTransferDetails.entityGroup || 'none')}
          countCurrent={countCurrentInGroup}
          countTotal={countTotalInGroup}
        />
      </Columns>
    </div>
  );
};

export default ProgressIndicators;
