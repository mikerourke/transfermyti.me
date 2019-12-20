import React from "react";
import styled from "@emotion/styled";

const List = styled.ul({
  listStyle: "circle",
  marginLeft: "1rem",

  "li:not(:last-child)": {
    marginBottom: "0.75rem",
  },
});

const InstructionsList: React.FC = () => (
  <div>
    <List>
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
    </List>
  </div>
);

export default InstructionsList;
