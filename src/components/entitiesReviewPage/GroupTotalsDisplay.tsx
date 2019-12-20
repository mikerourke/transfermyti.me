import React from "react";
import { Progress } from "bloomer";
import styled from "@emotion/styled";
import Flex from "../Flex";

const Label = styled.div({
  fontSize: 12,
  fontWeight: 700,
  textTransform: "uppercase",
  marginBottom: "0.25rem",
});

interface Props {
  label: string;
  included: number;
  total: number;
}

const GroupTotalsDisplay: React.FC<Props> = ({ label, included, total }) => (
  <Flex css={{ marginRight: "1rem" }} direction="column">
    <Label data-testid="group-totals-display-label">
      {label} ({included}/{total})
    </Label>
    <Progress
      css={{ minWidth: "16rem" }}
      isMarginless
      isColor="info"
      isSize="small"
      value={included}
      max={total}
    />
  </Flex>
);

export default GroupTotalsDisplay;
