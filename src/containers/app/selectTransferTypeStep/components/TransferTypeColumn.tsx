import React from 'react';
import classnames from 'classnames';
import { Box, Column, Title } from 'bloomer';
import { css } from 'emotion';

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
        className={classnames(
          css`
            height: 100%;
            min-height: 14rem;
            cursor: pointer;
            &:hover {
              opacity: 0.5;
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
