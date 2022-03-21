import React from "react";

import { styled } from "./emotion";

const StyledDiv = styled.div`
  margin-bottom: 2rem;
  padding: 0 1rem;
`;

interface Props extends React.HTMLProps<HTMLDivElement> {
  isExpanded: boolean;
}

const AccordionContent: React.FC<Props> = ({ isExpanded, ...props }) => (
  <StyledDiv
    style={{ display: isExpanded ? "block" : "none" }}
    role="region"
    aria-hidden={!isExpanded}
    {...props}
    as={undefined}
  />
);

export default AccordionContent;
