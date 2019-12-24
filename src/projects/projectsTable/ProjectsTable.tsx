import React from "react";
import { Table } from "rsuite";

export const ProjectsTableComponent: React.FC = props => {
  return (
    <Table height={420} data={fakeData} autoHeight>
      <Table.Column width={50} align="center" resizable>
        <Table.HeaderCell>Id</Table.HeaderCell>
        <Table.Cell dataKey="id" />
      </Table.Column>

      <Table.Column width={100} resizable>
        <Table.HeaderCell>First Name</Table.HeaderCell>
        <Table.Cell dataKey="firstName" />
      </Table.Column>

      <Table.Column width={100} resizable>
        <Table.HeaderCell>Last Name</Table.HeaderCell>
        <Table.Cell dataKey="lastName" />
      </Table.Column>

      <Table.Column width={200} resizable>
        <Table.HeaderCell>City</Table.HeaderCell>
        <Table.Cell dataKey="city" />
      </Table.Column>

      <Table.Column width={200} resizable>
        <Table.HeaderCell>Company Name</Table.HeaderCell>
        <Table.Cell dataKey="companyName" />
      </Table.Column>
    </Table>
  );
};

export default ProjectsTableComponent;
