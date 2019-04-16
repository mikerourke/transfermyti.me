import React from 'react';
import { css } from 'emotion';
import { Container, Hero, HeroBody, HeroHeader, Title } from 'bloomer';
import Flex from '~/components/flex/Flex';
import SvgIcon, { SvgIconName } from '~/components/svgIcon/SvgIcon';
import { TransferType } from '~/types';

interface Props {
  currentTransferType: TransferType;
}

const Header: React.FC<Props> = ({ currentTransferType }) => {
  let mode = 'Single User Mode';
  let iconName = SvgIconName.Person;

  if (currentTransferType === TransferType.MultipleUsers) {
    mode = 'Multiple User Mode';
    iconName = SvgIconName.People;
  }

  return (
    <header
      className={css`
        flex-shrink: 0;
      `}
    >
      <Hero isSize="small" isColor="dark">
        <HeroHeader>
          <Flex
            alignItems="center"
            justifyContent="space-between"
            className={css`
              padding: 0.5rem 1rem;
              border-bottom: 1px solid var(--light-gray);
            `}
          >
            <Flex alignItems="center">
              <SvgIcon name={iconName} color="white" height={16} />
              <span
                className={css`
                  margin-left: 0.5rem;
                  font-weight: 600;
                `}
              >
                {mode}
              </span>
            </Flex>
            <a
              href="https://github.com/mikerourke/toggl-to-clockify-web"
              target="_blank"
              rel="noopener noreferrer"
            >
              <SvgIcon name={SvgIconName.GitHub} color="white" height={16} />
            </a>
          </Flex>
        </HeroHeader>
        <HeroBody
          className={css`
            padding: 1rem !important;
          `}
        >
          <Container>
            <Title isSize={1} isMarginless>
              Toggl to Clockify
            </Title>
            <Title
              isSize={5}
              className={css`
                margin-top: 1rem;
              `}
            >
              Transfer all of your Toggl entries to Clockify.me
            </Title>
          </Container>
        </HeroBody>
      </Hero>
    </header>
  );
};

export default Header;
