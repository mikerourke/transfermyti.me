import React from "react";
import { css } from "emotion";
import { Container, Hero, HeroBody, HeroHeader, Title } from "bloomer";
import { Flex, Icon, IconName } from "~/common/components";
import { TransferType } from "~/app/appTypes";

interface Props {
  currentTransferType: TransferType;
}

const Header: React.FC<Props> = ({ currentTransferType }) => {
  let mode = "Single User Mode";
  let iconName: IconName = "person";

  if (currentTransferType === TransferType.MultipleUsers) {
    mode = "Multiple User Mode";
    iconName = "people";
  }

  return (
    <header>
      <Hero isSize="small" isColor="dark">
        <HeroHeader>
          <Flex
            alignItems="center"
            justifyContent="space-between"
            className={css({
              padding: "0.5rem 1rem",
              borderBottom: "1px solid var(--light-gray)",
            })}
          >
            <Flex alignItems="center">
              <Icon name={iconName} color="white" height={16} />
              <span className={css({ marginLeft: "0.5rem", fontWeight: 600 })}>
                {mode}
              </span>
            </Flex>
            <a
              href="https://github.com/mikerourke/toggl-to-clockify-web"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="github" color="white" height={16} />
            </a>
          </Flex>
        </HeroHeader>
        <HeroBody style={{ padding: "1rem" }}>
          <Container>
            <Title isSize={1} isMarginless>
              Toggl to Clockify
            </Title>
            <Title isSize={5} className={css({ marginTop: "1rem" })}>
              Transfer all of your Toggl entries to Clockify.me
            </Title>
          </Container>
        </HeroBody>
      </Hero>
    </header>
  );
};

export default Header;
