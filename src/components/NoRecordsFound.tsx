import React from "react";

import { styled } from "./emotion";

const StyledDiv = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  padding: 3rem 0;
  text-align: center;
`;

const NoRecordsFound: React.FC = () => <StyledDiv>No records found!</StyledDiv>;

export default NoRecordsFound;
