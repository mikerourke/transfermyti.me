import React from 'react';
import { css } from 'emotion';

const InstructionsList: React.FunctionComponent = () => (
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
      If you're managing a team, it can get tricky. You should be able to
      transfer all of the <strong>User Groups</strong> to the new workspace, but
      I can't say what will happen to the <strong>Users</strong> because it's
      difficult to test. Your best bet is probably to invite each user to the
      Clockify workspace once the transfer is complete, and instruct them to
      transfer their entries using this tool.
    </li>
    <li>
      Once you hit the <strong>Next</strong> button and confirm, it will
      transfer all your selections to the new workspaces. Don't worry, it won't
      overwrite Projects, Clients, Tags, Tasks, User Groups or Users (it fetches
      the Clockify entities and does a name comparison).
    </li>
    <li>
      This tool will copy all of your time entries from Toggl, even if they
      already exist on Clockify!
    </li>
  </ul>
);

export default InstructionsList;
