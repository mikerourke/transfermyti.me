import React from "react";
import { css } from "emotion";

const InstructionsList: React.FC = () => (
  <div>
    <ul
      className={css`
        list-style: circle;
        margin-left: 1rem;

        li:not(:last-child) {
          margin-bottom: 0.75rem;
        }
      `}
    >
      <li>
        The progress indicator in the <strong>left</strong> column represents
        the transfer progress for every record in every workspace.
      </li>
      <li>
        The progress indicator in the <strong>center</strong> column represents
        the transfer progress for all records associated with the in-transfer
        workspace.
      </li>
      <li>
        The progress indicator in the <strong>right</strong> column represents
        the transfer progress for the current in-transfer entity group (e.g.
        Tags).
      </li>
    </ul>
  </div>
);

export default InstructionsList;
