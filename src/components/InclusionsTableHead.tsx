import React from "react";

import { kebabCase } from "~/utils";

interface Props {
  labels: string[];
}

const InclusionsTableHead: React.FC<Props> = ({ labels, ...props }) => (
  <thead {...props}>
    <tr>
      {labels.map((label) => (
        <th key={kebabCase(label)} scope="col">
          {label}
        </th>
      ))}
      <th data-include={true} scope="col">
        Include?
      </th>
    </tr>
  </thead>
);

export default InclusionsTableHead;
