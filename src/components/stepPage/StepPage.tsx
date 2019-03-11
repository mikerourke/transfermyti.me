import React, { useEffect, useRef } from 'react';
import { Button, Container, Subtitle, Title } from 'bloomer';
import { When } from 'react-if';
import { css } from 'emotion';
import { isNil } from 'lodash';
import Flex from '~/components/flex/Flex';

interface Props {
  stepNumber: number;
  subtitle: string;
  isNextLoading?: boolean;
  next?: () => void;
  previous?: () => void;
  onRefreshClick?: () => void;
  onResize?: (newWidth: number) => void;
}

const StepPage: React.FC<Props> = ({
  children,
  stepNumber,
  subtitle,
  isNextLoading,
  next,
  previous,
  onRefreshClick,
  onResize,
}) => {
  const contentsRef = useRef(null);

  const handleResize = () => {
    const width = contentsRef.current.clientWidth;
    if (!isNil(onResize)) onResize(width);
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
      <Title isSize={4}>{`Step ${stepNumber}:`}</Title>
      <Subtitle isSize={3}>{subtitle}</Subtitle>
      <div
        ref={contentsRef}
        className={css`
          min-height: 300px;
        `}
      >
        {children}
      </div>
      <Flex
        justifyContent="space-between"
        className={css`
          margin-top: 1.5rem;
        `}
      >
        <Flex justifySelf="flex-start">
          <When condition={!isNil(onRefreshClick)}>
            <Button isSize="medium" onClick={onRefreshClick} isColor="info">
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
              isLoading={isNextLoading}
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
