import React from "react";
import { isNil } from "lodash";

interface Props {
  checked?: boolean;
  size: number | string;
  onClick: () => void;
}

enum CheckedState {
  Checked,
  Unchecked,
  Indeterminate,
}

export const statePaths = [
  // CheckedState.Checked:
  "M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
  // CheckedState.Unchecked:
  "M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z",
  // CheckedState.Indeterminate:
  "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2z",
];

const Checkbox: React.FC<Props> = ({ checked, size, onClick }) => {
  let state = CheckedState.Indeterminate;
  let ariaChecked: "mixed" | "true" | "false" = "mixed";

  if (!isNil(checked)) {
    state = checked ? CheckedState.Checked : CheckedState.Unchecked;
    ariaChecked = checked ? "true" : "false";
  }

  return (
    <svg
      data-testid="checkbox-svg"
      role="checkbox"
      aria-checked={ariaChecked}
      viewBox="0 0 24 24"
      height={size}
      width={size}
      onClick={onClick}
      css={{ cursor: "pointer" }}
    >
      <path
        data-testid="checkbox-path"
        d={statePaths[state]}
        fill="var(--info)"
      />
    </svg>
  );
};

export default Checkbox;
