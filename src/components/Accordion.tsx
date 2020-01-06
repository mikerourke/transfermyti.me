import React from "react";

const Accordion: React.FC = ({ children, ...props }) => (
  <section {...props}>
    <div role="presentation">{children}</div>
  </section>
);

export default Accordion;
