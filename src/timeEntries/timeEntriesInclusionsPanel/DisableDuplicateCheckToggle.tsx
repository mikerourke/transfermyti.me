import React from "react";
import { styled, Toggle } from "~/components";

const Label = styled.div(
  {
    marginBottom: "0.75rem",
  },
  ({ theme }) => ({
    fontWeight: theme.fontWeights.bold,
  }),
);

interface Props {
  isToggled: boolean;
  onToggle: VoidFunction;
}

const DisableDuplicateCheckToggle: React.FC<Props> = ({
  isToggled,
  onToggle,
  ...props
}) => (
  <div css={{ marginBottom: "0.75rem" }} {...props}>
    <Label id="disable-duplicate-check-toggle">
      Disable the time entry duplication check?
    </Label>
    <Toggle
      aria-label="Disable the time entry duplication check?"
      aria-labelledby="disable-duplicate-check-toggle"
      css={theme => ({ background: theme.colors.white })}
      isToggled={isToggled}
      onToggle={onToggle}
    />
  </div>
);

export default DisableDuplicateCheckToggle;
