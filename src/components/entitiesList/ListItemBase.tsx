import React from "react";
import classnames from "classnames";
import { Box } from "bloomer";
import { css } from "emotion";
import { ListRowProps } from "react-virtualized";
import Flex from "~/components/Flex";

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
  ...listRowProps
}) => (
  <Flex {...listRowProps} alignItems="center" justifyContent="flex-start">
    <Flex
      data-testid="list-item-base-inner"
      as={Box}
      alignItems="center"
      className={classnames(
        css({
          opacity: isOmitted ? 0.6 : 1,
          height,
          width: "100%",
          margin: "0 1rem",
        }),
        className,
      )}
    >
      {children}
    </Flex>
  </Flex>
);

export default ListItemBase;
