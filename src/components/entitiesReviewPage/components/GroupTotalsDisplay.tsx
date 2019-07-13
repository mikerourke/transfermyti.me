import React from "react";
import { css } from "emotion";
import { Progress } from "bloomer";
import Flex from "~/components/flex/Flex";

interface Props {
  label: string;
  included: number;
  total: number;
}

const GroupTotalsDisplay: React.FC<Props> = ({ label, included, total }) => (
  <Flex
    direction="column"
    className={css`
      margin-right: 1rem;
    `}
  >
    <div
      className={css`
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        margin-bottom: 0.25rem;
      `}
    >
      {label} ({included}/{total})
    </div>
    <Progress
      className={css`
        min-width: 16rem;
      `}
      isMarginless
      isColor="info"
      isSize="small"
      value={included}
      max={total}
    />
  </Flex>
);

export default GroupTotalsDisplay;
