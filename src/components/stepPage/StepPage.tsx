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
  contentRef?: (element: any) => void;
}

class StepPage extends React.Component<Props> {
  public render() {
    const { contentRef, onNextClick, onPreviousClick } = this.props;

    return (
      <Container>
        <Title isSize={4}>{this.props.title}</Title>
        <Subtitle isSize={3}>{this.props.subtitle}</Subtitle>
        <div
          ref={!isNil(contentRef) ? contentRef : undefined}
          className={css`
            min-height: 300px;
          `}
        >
          {this.props.children}
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
            isLoading={this.props.isNextLoading}
            onClick={onNextClick}
            isColor="success"
          >
            Next
          </ShowIf>
        </div>
      </Container>
    );
  }
}

export default StepPage;
