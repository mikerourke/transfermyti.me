import React from "react";

import Icon from "./Icon";

interface Props extends Omit<React.HTMLProps<HTMLAnchorElement>, "color"> {
  children: React.ReactNode;
  color: string;
}

const ExternalLink: React.FC<Props> = ({ children, color, ...props }) => (
  <a style={{ color }} rel="noopener noreferrer" target="_blank" {...props}>
    {children}

    <Icon
      name="openExternal"
      color={color}
      size={12}
      style={{ margin: "0 0.25rem" }}
    />
  </a>
);

export default ExternalLink;
