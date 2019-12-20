import React from "react";
import { divide, isNaN, round } from "lodash";
import { Box, Column, Heading, Subtitle, Title } from "bloomer";
import { Progress } from "react-sweet-progress";
import { Flex } from "~/common/components";
import { TransferCountsModel } from "~/app/appTypes";

interface Props extends TransferCountsModel {
  title: string;
  subtitle: string;
}

const ProgressIndicatorColumn: React.FC<Props> = ({
  countCurrent,
  countTotal,
  ...props
}) => {
  const calculatePercentage = (current: number, total: number): number => {
    const ratio = divide(current, total);
    const percentage = round(ratio * 100, 0);
    return isNaN(percentage) ? 0 : percentage;
  };

  const progressPercent = calculatePercentage(countCurrent, countTotal);

  return (
    <Column isSize="1/3">
      <Flex as={Box} direction="column" alignItems="center">
        <Title>{props.title}</Title>
        <Subtitle>{props.subtitle}</Subtitle>
        <Progress
          type="circle"
          width={180}
          strokeWidth={12}
          percent={progressPercent}
        />
        <Heading>
          Transferred <strong>{countCurrent}</strong> of
          <strong> {countTotal}</strong> records
        </Heading>
      </Flex>
    </Column>
  );
};

export default ProgressIndicatorColumn;
