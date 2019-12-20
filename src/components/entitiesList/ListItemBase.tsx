import React from "react";
import { Box } from "bloomer";
import { ListRowProps } from "react-virtualized";
import Flex from "../Flex";

interface Props extends Partial<ListRowProps> {
  height: number;
  isOmitted: boolean;
  className?: string;
}

const ListItemBase: React.FC<Props> = ({
  children,
  height,
  isOmitted,
  className,
  ...props
}) => (
  <Flex {...props} alignItems="center" justifyContent="flex-start">
    <Flex
      data-testid="list-item-base-inner"
      as={Box}
      alignItems="center"
      css={{
        opacity: isOmitted ? 0.6 : 1,
        height,
        width: "100%",
        margin: "0 1rem",
      }}
      className={className}
    >
      {children}
    </Flex>
  </Flex>
);

export default ListItemBase;
