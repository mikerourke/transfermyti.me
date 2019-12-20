import React, { useEffect, useRef } from "react";
import { Button, Container } from "bloomer";
import { When } from "react-if";
import { isNil } from "lodash";
import styled from "@emotion/styled";
import Flex from "../Flex";
import PageHeader from "../PageHeader";
import InstructionsSection from "./InstructionsSection";

const RefreshButton = styled(Button)({
  background: "rgba(125, 103, 198, 1)",
  color: "white",

  "&:hover": {
    background: "rgba(125, 103, 198, 0.8)",
    color: "white",
  },
});

export interface StepPageProps {
  stepNumber: number;
  instructions?: React.ReactElement<unknown> | string;
  onNextClick?: () => void;
  onPreviousClick?: () => void;
}

interface Props extends StepPageProps {
  subtitle: string;
  isNextLoading?: boolean;
  onRefreshClick?: () => void;
  onResize?: (newWidth: number) => void;
}

const StepPage: React.FC<Props> = ({
  onNextClick,
  onPreviousClick,
  ...props
}) => {
  const contentsRef = useRef(null);

  const handleResize = (): void => {
    const width = contentsRef.current.clientWidth;
    if (!isNil(props.onResize)) {
      props.onResize(width);
    }
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  });

  return (
    <Container data-testid="step-page">
      <PageHeader
        title={`Step ${props.stepNumber}:`}
        subtitle={props.subtitle}
      />
      <div ref={contentsRef}>
        <When condition={!isNil(props.instructions)}>
          <InstructionsSection>{props.instructions}</InstructionsSection>
        </When>
        {props.children}
      </div>
      <Flex justifyContent="space-between" css={{ marginTop: "1.5rem" }}>
        <Flex justifySelf="flex-start">
          <When condition={!isNil(props.onRefreshClick)}>
            <RefreshButton
              data-testid="step-page-refresh-button"
              isSize="medium"
              onClick={props.onRefreshClick}
            >
              Refresh
            </RefreshButton>
          </When>
        </Flex>
        <Flex justifySelf="flex-end">
          <When condition={!isNil(onPreviousClick)}>
            <Button
              data-testid="step-page-previous-button"
              isSize="medium"
              onClick={onPreviousClick}
              isColor="dark"
            >
              Previous
            </Button>
          </When>
          <When condition={!isNil(onPreviousClick) && !isNil(onNextClick)}>
            <div
              data-testid="step-page-button-separator"
              css={{ marginRight: "1rem" }}
            />
          </When>
          <When condition={!isNil(onNextClick)}>
            <Button
              data-testid="step-page-next-button"
              isSize="medium"
              isLoading={props.isNextLoading}
              onClick={onNextClick}
              isColor="success"
            >
              Next
            </Button>
          </When>
        </Flex>
      </Flex>
    </Container>
  );
};

export default StepPage;
