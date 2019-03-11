import React from 'react';
import { Box, Column, Title } from 'bloomer';
import { css } from 'emotion';
import cx from 'classnames';

interface Props {
  isSelected: boolean;
  title: string;
  onSelect: () => void;
}

const TransferTypeColumn: React.FC<Props> = ({
  children,
  title,
  isSelected,
  onSelect,
}) => {
  const selectedClass = css`
    background-color: var(--info);
    color: white;
  `;

  return (
    <Column isSize="1/2">
      <Box
        className={cx(
          css`
            height: 100%;
            cursor: pointer;
            &:hover {
              border: 2px solid #4a4a4a;
            }
          `,
          { [selectedClass]: isSelected },
        )}
        onClick={onSelect}
      >
        <Title
          className={css`
            color: inherit;
          `}
          isSize={2}
        >
          {title}
        </Title>
        <p
          className={css`
            font-size: 20px;

            strong {
              color: inherit;
            }
          `}
        >
          {children}
        </p>
      </Box>
    </Column>
  );
};

export default TransferTypeColumn;
