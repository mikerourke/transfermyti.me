import React from 'react';
import classnames from 'classnames';
import { Box } from 'bloomer';
import { css } from 'emotion';
import { ListRowProps } from 'react-virtualized';
import Flex from '~/components/flex/Flex';

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
}) => {
  return (
    <Flex {...listRowProps} alignItems="center" justifyContent="flex-start">
      <Flex
        as={Box}
        alignItems="center"
        className={classnames(
          css`
            margin-left: 0.5rem;
            opacity: ${isOmitted ? 0.6 : 1};
            padding-left: 1rem;
            width: calc(100% - 2rem);
            height: ${height}px;
          `,
          className,
        )}
      >
        {children}
      </Flex>
    </Flex>
  );
};

export default ListItemBase;
