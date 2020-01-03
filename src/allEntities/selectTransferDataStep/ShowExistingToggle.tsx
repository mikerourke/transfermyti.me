import React from "react";
import { Toggle } from "~/components";

interface Props {
  isToggled: boolean;
  onToggle: VoidFunction;
}

const ShowExistingToggle: React.FC<Props> = ({
  isToggled,
  onToggle,
  ...props
}) => (
  <div css={{ marginBottom: "0.75rem" }} {...props}>
    <div
      id="showExistingToggle"
      css={{ fontWeight: "bold", marginBottom: "0.75rem" }}
    >
      Show records that already exist in target?
    </div>
    <Toggle
      aria-label="Show records that already exist in target?"
      aria-labelledby="showExistingToggle"
      isToggled={isToggled}
      onToggle={onToggle}
    />
  </div>
);

export default ShowExistingToggle;
