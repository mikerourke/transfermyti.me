import React, { useEffect, useRef } from 'react';
import { Button, Container } from 'bloomer';
import { When, Unless } from 'react-if';
import { css } from 'emotion';
import { isNil } from 'lodash';
import Flex from '~/components/flex/Flex';
import PageHeader from '~/components/pageHeader/PageHeader';
import InstructionsSection from './components/InstructionsSection';

export interface StepPageProps {
  stepNumber: number;
  instructions?: React.ReactElement<any> | string;
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

  const handleResize = () => {
    const width = contentsRef.current.clientWidth;
    if (!isNil(props.onResize)) props.onResize(width);
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });

  return (
    <Container>
      <PageHeader
        title={`Step ${props.stepNumber}:`}
        subtitle={props.subtitle}
      />
      <div ref={contentsRef}>
        <Unless condition={isNil(props.instructions)}>
          <InstructionsSection>{props.instructions}</InstructionsSection>
        </Unless>
        {props.children}
      </div>
      <Flex
        justifyContent="space-between"
        className={css`
          margin-top: 1.5rem;
        `}
      >
        <Flex justifySelf="flex-start">
          <When condition={!isNil(props.onRefreshClick)}>
            <Button
              isSize="medium"
              onClick={props.onRefreshClick}
              className={css`
                background: rgba(125, 103, 198, 1);
                color: white;

                &:hover {
                  background: rgba(125, 103, 198, 0.8);
                  color: white;
                }
              `}
            >
              Refresh
            </Button>
          </When>
        </Flex>
        <Flex justifySelf="flex-end">
          <When condition={!isNil(onPreviousClick)}>
            <Button isSize="medium" onClick={onPreviousClick} isColor="dark">
              Previous
            </Button>
          </When>
          <When condition={!isNil(onPreviousClick) && !isNil(onNextClick)}>
            <div
              className={css`
                margin-right: 1rem;
              `}
            />
          </When>
          <When condition={!isNil(onNextClick)}>
            <Button
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
