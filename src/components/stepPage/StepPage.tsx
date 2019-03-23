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
      <Title isSize={4}>{`Step ${props.stepNumber}:`}</Title>
      <Subtitle isSize={3}>{props.subtitle}</Subtitle>
      <div
        ref={contentsRef}
        className={css`
          min-height: 300px;
        `}
      >
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
              isColor="info"
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
