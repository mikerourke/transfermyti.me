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
  const selectedClass = css({
    backgroundColor: "var(--info)",
    color: "white",
  });

  return (
    <Column isSize="1/2">
      <Box
        className={classnames(
          css({
            height: "100%",
            minHeight: "14rem",
            cursor: "pointer",

            "&:hover": {
              opacity: 0.5,
            },
          }),
          { [selectedClass]: props.isSelected },
        )}
        onClick={props.isDisabled ? undefined : props.onSelect}
      >
        <Title
          className={css({
            color: "inherit",
            textDecoration: props.isDisabled ? "line-through" : undefined,
          })}
          isSize={2}
        >
          {props.title}
        </Title>
        <p
          className={css({
            fontSize: 20,
            textDecoration: props.isDisabled ? "line-through" : undefined,

            strong: {
              color: "inherit",
            },
          })}
        >
          {props.children}
        </p>
      </Box>
    </Column>
  );
};

export default TransferTypeColumn;
