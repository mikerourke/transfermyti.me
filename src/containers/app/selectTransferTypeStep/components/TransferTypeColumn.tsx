import React from "react";
import classnames from "classnames";
import { Box, Column, Title } from "bloomer";
import { css } from "emotion";

// TODO: Get rid of `isDisabled` when multi-user mode is working.

interface Props {
  isDisabled: boolean;
  isSelected: boolean;
  title: string;
  onSelect: () => void;
}

const TransferTypeColumn: React.FC<Props> = props => {
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
          { [selectedClass]: props.isSelected },
        )}
        onClick={props.isDisabled ? undefined : props.onSelect}
      >
        <Title
          className={css`
            color: inherit;
            ${props.isDisabled && "text-decoration: line-through"};
          `}
          isSize={2}
        >
          {props.title}
        </Title>
        <p
          className={css`
            font-size: 20px;
            ${props.isDisabled && "text-decoration: line-through"};

            strong {
              color: inherit;
            }
          `}
        >
          {props.children}
        </p>
      </Box>
    </Column>
  );
};

export default TransferTypeColumn;
