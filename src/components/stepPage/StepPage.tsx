import React from 'react';
import isNil from 'lodash/isNil';
import { css } from 'emotion';
import { Button, Container, Subtitle, Title } from 'bloomer';
import ShowIf from '../showIf/ShowIf';

interface Props {
  title: string;
  subtitle: string;
  isNextLoading?: boolean;
  onNextClick?: () => void;
  onPreviousClick?: () => void;
}

const StepPage: React.FunctionComponent<Props> = ({
  children,
  title,
  subtitle,
  isNextLoading,
  onNextClick,
  onPreviousClick,
}) => (
  <Container>
    <Title isSize={4}>{title}</Title>
    <Subtitle isSize={3}>{subtitle}</Subtitle>
    <div
      className={css`
        min-height: 300px;
      `}
    >
      {children}
    </div>
    <div
      className={css`
        display: flex;
        justify-content: flex-end;
        margin-top: 1.5rem;
      `}
    >
      <ShowIf
        as={Button}
        isShown={!isNil(onPreviousClick)}
        isSize="medium"
        onClick={onPreviousClick}
        isColor="dark"
      >
        Previous
      </ShowIf>
      <ShowIf
        isShown={!isNil(onPreviousClick) && !isNil(onNextClick)}
        className={css`
          margin-right: 1rem;
        `}
      />
      <ShowIf
        as={Button}
        isShown={!isNil(onNextClick)}
        isSize="medium"
        isLoading={isNextLoading}
        onClick={onNextClick}
        isColor="success"
      >
        Next
      </ShowIf>
    </div>
  </Container>
);

export default StepPage;
