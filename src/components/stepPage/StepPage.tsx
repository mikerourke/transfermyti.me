import React, { useEffect, useRef } from 'react';
import { Button, Container, Subtitle, Title } from 'bloomer';
import { css } from 'emotion';
import isNil from 'lodash/isNil';
import Flex from '../flex/Flex';
import ShowIf from '../showIf/ShowIf';

interface Props {
  title: string;
  subtitle: string;
  isNextLoading?: boolean;
  next?: () => void;
  previous?: () => void;
  onRefreshClick?: () => void;
  onResize?: (newWidth: number) => void;
}

const StepPage: React.FunctionComponent<Props> = ({
  children,
  title,
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
      <Title isSize={4}>{title}</Title>
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
          <ShowIf
            as={Button}
            isShown={!isNil(onRefreshClick)}
            isSize="medium"
            onClick={onRefreshClick}
            isColor="dark"
          >
            Refresh
          </ShowIf>
        </Flex>
        <Flex justifySelf="flex-end">
          <ShowIf
            as={Button}
            isShown={!isNil(previous)}
            isSize="medium"
            onClick={previous}
            isColor="dark"
          >
            Previous
          </ShowIf>
          <ShowIf
            isShown={!isNil(previous) && !isNil(next)}
            className={css`
              margin-right: 1rem;
            `}
          />
          <ShowIf
            as={Button}
            isShown={!isNil(next)}
            isSize="medium"
            isLoading={isNextLoading}
            onClick={next}
            isColor="success"
          >
            Next
          </ShowIf>
        </Flex>
      </Flex>
    </Container>
  );
};

export default StepPage;
