import React from 'react';
import { css } from 'emotion';

const InstructionsList: React.FC = () => (
  <ul
    className={css`
      list-style: circle;
      margin-left: 1rem;

      li {
        margin-bottom: 0.75rem;
      }

      li:last-child {
        font-weight: 700;
      }
    `}
  >
    <li>
      If you deselect a <strong>Project</strong>, all time entries associated
      with it will be omitted from the transfer.
    </li>
    <li>
      If you deselect a <strong>Tag</strong> or <strong>Client</strong>, it
      won't be associated with the time entry. If you uncheck one of these in
      error and perform the transfer, you'll either have to go through each
      entry and manually update it, or delete the workspace and start over.
    </li>
    <li>
      Once you hit the <strong>Next</strong> button, you'll have a chance to
      review what will be transferred to Clockify.
    </li>
  </ul>
);

export default InstructionsList;
