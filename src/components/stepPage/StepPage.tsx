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

const StepPage: React.FunctionComponent<Props> = props => (
  <Container>
    <Title isSize={4}>{props.title}</Title>
    <Subtitle isSize={3}>{props.subtitle}</Subtitle>
    <div
      className={css`
        min-height: 300px;
      `}
    >
      {props.children}
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
        isShown={!isNil(props.onPreviousClick)}
        isSize="medium"
        onClick={props.onPreviousClick}
        isColor="info"
      >
        Previous
      </ShowIf>
      <ShowIf
        isShown={!isNil(props.onPreviousClick) && !isNil(props.onNextClick)}
        className={css`
          margin-right: 1rem;
        `}
      />
      <ShowIf
        as={Button}
        isShown={!isNil(props.onNextClick)}
        isSize="medium"
        isLoading={props.isNextLoading}
        onClick={props.onNextClick}
        isColor="success"
      >
        Next
      </ShowIf>
    </div>
  </Container>
);

export default StepPage;
