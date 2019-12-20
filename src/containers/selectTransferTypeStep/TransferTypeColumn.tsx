import React from "react";
import { Box, Column, Title } from "bloomer";
import styled from "@emotion/styled";

const Wrapper = styled(Box)(
  {
    height: "100%",
    minHeight: "14rem",
    cursor: "pointer",

    "&:hover": {
      opacity: 0.5,
    },
  },
  ({ isSelected }: { isSelected: boolean }) => ({
    backgroundColor: isSelected && "var(--info)",
    color: isSelected && "white",
  }),
);

const Content = styled.p<{ isDisabled: boolean }>(
  {
    fontSize: 20,

    strong: {
      color: "inherit",
    },
  },
  ({ isDisabled }) => ({
    textDecoration: isDisabled ? "line-through" : undefined,
  }),
);

// TODO: Get rid of `isDisabled` when multi-user mode is working.

interface Props {
  isDisabled: boolean;
  isSelected: boolean;
  title: string;
  onSelect: () => void;
}

const TransferTypeColumn: React.FC<Props> = props => (
  <Column isSize="1/2">
    <Wrapper
      isSelected={props.isSelected}
      onClick={props.isDisabled ? undefined : props.onSelect}
    >
      <Title
        css={{
          color: "inherit",
          textDecoration: props.isDisabled ? "line-through" : undefined,
        }}
        isSize={2}
      >
        {props.title}
      </Title>
      <Content isDisabled={props.isDisabled}>{props.children}</Content>
    </Wrapper>
  </Column>
);

export default TransferTypeColumn;
