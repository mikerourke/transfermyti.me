import React from "react";
import { styled } from "./emotion";

const Base = styled.div({
  marginBottom: "2rem",
  padding: "0 1rem",
});

interface Props extends React.HTMLProps<HTMLDivElement> {
  isExpanded: boolean;
}

const AccordionContent: React.FC<Props> = ({ isExpanded, ...props }) => (
  <Base
    css={{ display: isExpanded ? "block" : "none" }}
    role="region"
    aria-hidden={!isExpanded}
    {...props}
  />
);

export default AccordionContent;
