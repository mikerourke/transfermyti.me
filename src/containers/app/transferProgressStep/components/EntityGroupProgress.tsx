import React from 'react';
import { startCase } from 'lodash';
import { Box, Progress, Title } from 'bloomer';
import { InTransferDetailsModel } from '~/types';

interface Props {
  inTransferDetails: InTransferDetailsModel;
}

const EntityGroupProgress: React.FC<Props> = ({ inTransferDetails }) => {
  return (
    <Box>
      <Title isSize={3}>{startCase(inTransferDetails.entityGroup)}</Title>
      <Progress
        isSize="large"
        value={inTransferDetails.countCurrent}
        max={inTransferDetails.countTotal}
      />
    </Box>
  );
};

export default EntityGroupProgress;
