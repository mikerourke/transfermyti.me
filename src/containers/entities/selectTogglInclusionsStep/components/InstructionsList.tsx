import React from 'react';
import { css } from 'emotion';

const InstructionsList: React.FC = () => (
  <div>
    <ul
      className={css`
        list-style: circle;
        margin-left: 1rem;

        li:not(:last-child) {
          margin-bottom: 0.75rem;
        }

        li:last-child {
          color: var(--info);
          font-weight: 500;
        }

        span:last-child {
          color: var(--info);
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
        won&apos;t be associated with the time entry. If you uncheck one of
        these in error and perform the transfer, you&apos;ll either have to go
        through each entry and manually update it, or delete the workspace and
        start over.
      </li>
      <li>
        Once you hit the <span>Next</span> button, you&apos;ll have a chance to
        review what will be transferred to Clockify.
      </li>
    </ul>
  </div>
);

export default InstructionsList;
