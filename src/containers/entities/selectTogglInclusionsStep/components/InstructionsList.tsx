import React from 'react';
import { css } from 'emotion';
import EntityTag, { EntityTagType } from '~/components/entityTag/EntityTag';

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

        li:last-child > strong {
          color: var(--info);
          font-weight: 700;
        }

        span {
          font-weight: 700;
          margin: 0 4px;
          vertical-align: bottom;
        }
      `}
    >
      <li>
        The
        <EntityTag size="small" tagType={EntityTagType.Archived} />
        tag for a project indicates that it is archived on Toggl but won&apos;t
        be archived on Clockify. Time entries associated with an archived
        project also have this tag.
      </li>
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
        Any items you deselect will be marked with the
        <EntityTag size="small" tagType={EntityTagType.Excluded} />
        tag to indicate that you explicitly excluded them from transfer.
      </li>
      <li>
        Once you hit the <strong>Next</strong> button, you&apos;ll have a chance
        to review what will be transferred to Clockify.
      </li>
    </ul>
  </div>
);

export default InstructionsList;
