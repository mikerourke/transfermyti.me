import React from 'react';
import { Table } from 'bloomer';

export interface WorkspaceRecord {
  workspaceId: number;
  year: number;
  isSelected: boolean;
}

interface Props {
  workspaceRecords: WorkspaceRecord[];
}

class WorkspaceSelector extends React.Component<Props> {
  private renderRows = () => {
    const { workspaceRecords } = this.props;

  };

  public render() {
    return (
      <Table isBordered>
        <thead>
        <tr>
          <th>Workspace Name</th>
          <th>Year</th>
        </tr>
        </thead>
        <tbody>

        </tbody>
      </Table>
    );
  }
}

export default WorkspaceSelector;
