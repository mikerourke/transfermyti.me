import React from 'react';
import classnames from 'classnames';
import { css } from 'emotion';
import { isNil } from 'lodash';

type GlobalOption = 'inherit' | 'initial' | 'unset';

type CommonPositionalOption =
  | GlobalOption
  | 'baseline'
  | 'center'
  | 'end'
  | 'first baseline'
  | 'flex-end'
  | 'flex-start'
  | 'last baseline'
  | 'left'
  | 'right'
  | 'safe center'
  | 'start'
  | 'stretch'
  | 'unsafe center';

type SelfPositionalOption = 'normal' | 'self-end' | 'self-start';

type SpacePositionalOption = 'space-around' | 'space-between' | 'space-evenly';

interface Props {
  as?: string | React.ReactElement<any> | React.ReactNode;
  className?: string;
  alignItems?: CommonPositionalOption | SelfPositionalOption;
  alignSelf?: CommonPositionalOption | SelfPositionalOption;
  justifyContent?: CommonPositionalOption | SpacePositionalOption;
  justifySelf?: CommonPositionalOption | SelfPositionalOption;
  direction?: 'column' | 'column-reverse' | 'row' | 'row-reverse';
}

const Flex: React.FC<Props | any> = ({
  as,
  className,
  alignItems,
  alignSelf,
  justifyContent,
  justifySelf,
  direction,
  ...props
}) => {
  const classes = classnames(
    className,
    css`
      display: flex;
      ${!isNil(alignItems) && `align-items: ${alignItems};`}
      ${!isNil(alignSelf) && `align-self: ${alignSelf};`}
      ${!isNil(justifyContent) && `justify-content: ${justifyContent};`}
      ${!isNil(justifySelf) && `justify-self: ${justifySelf};`}
      ${!isNil(direction) && `flex-direction: ${direction};`}
    `,
  );

  const Element = as;
  return <Element className={classes} {...props} />;
};

Flex.defaultProps = {
  as: 'div',
};

export default Flex;
