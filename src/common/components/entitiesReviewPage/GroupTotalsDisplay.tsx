import React from "react";
import { css } from "emotion";
import { Progress } from "bloomer";
import Flex from "../Flex";

interface Props {
  label: string;
  included: number;
  total: number;
}

const GroupTotalsDisplay: React.FC<Props> = ({ label, included, total }) => (
  <Flex className={css({ marginRight: "1rem" })} direction="column">
    <div
      data-testid="group-totals-display-label"
      className={css({
        fontSize: 12,
        fontWeight: 700,
        textTransform: "uppercase",
        marginBottom: "0.25rem",
      })}
    >
      {label} ({included}/{total})
    </div>
    <Progress
      className={css({ minWidth: "16rem" })}
      isMarginless
      isColor="info"
      isSize="small"
      value={included}
      max={total}
    />
  </Flex>
);

export default GroupTotalsDisplay;
