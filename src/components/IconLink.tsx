import React from "react";

import { styled } from "./emotion";
import Icon, { IconName } from "./Icon";

const StyledAnchor = styled.a`
  display: block;
  overflow: hidden;
  white-space: nowrap;

  &:hover {
    path {
      fill: lightblue;
    }
  }
`;

interface Props extends React.HTMLProps<HTMLAnchorElement> {
  iconName: IconName;
  size?: number;
}

const IconLink: React.FC<Props> = ({
  children,
  iconName,
  size = 24,
  ...props
}) => {
  return (
    <StyledAnchor
      style={{ width: size, height: size }}
      {...props}
      as={undefined}
    >
      <Icon color="white" name={iconName} size={size} />

      {children}
    </StyledAnchor>
  );
};

export default IconLink;
