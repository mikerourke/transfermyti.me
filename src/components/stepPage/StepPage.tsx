import React, { useEffect, useRef } from 'react';
import { Button, Container, Subtitle, Title } from 'bloomer';
import { When } from 'react-if';
import { css } from 'emotion';
import { isNil } from 'lodash';
import Flex from '~/components/flex/Flex';

export interface StepPageProps {
  stepNumber: number;
  next?: () => void;
  previous?: () => void;
}

interface Props extends StepPageProps {
  subtitle: string;
  isNextLoading?: boolean;
  onRefreshClick?: () => void;
  onResize?: (newWidth: number) => void;
}

const StepPage: React.FC<Props> = ({ next, previous, ...props }) => {
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
      <h1
      <Subtitle isSize={3}>{props.subtitle}</Subtitle>
      <div
        ref={contentsRef}
        className={css`
          margin-bottom: 0;
          font-size: 1.5rem;
          color: var(--dark-gray);
          font-weight: 600;
          line-height: 1.125;
        `}
      >
        Step {props.stepNumber}:
      </h1>
      <h2
        className={css`
          margin-bottom: 0.5rem;
          font-size: 2rem;
          font-weight: 400;
          color: var(--dark-gray);
        `}
      >
        {props.subtitle}
      </h2>
      <div ref={contentsRef}>{props.children}</div>
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
          <When condition={!isNil(previous)}>
            <Button isSize="medium" onClick={previous} isColor="dark">
              Previous
            </Button>
          </When>
          <When condition={!isNil(previous) && !isNil(next)}>
            <div
              className={css`
                margin-right: 1rem;
              `}
            />
          </When>
          <When condition={!isNil(next)}>
            <Button
              isSize="medium"
              isLoading={props.isNextLoading}
              onClick={next}
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
