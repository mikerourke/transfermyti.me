import React from 'react';
import { Container, Hero, HeroBody } from 'bloomer';
import HeaderLogo from './HeaderLogo';

const Header: React.FunctionComponent = () => (
  <Hero isSize="small" isColor="light">
    <HeroBody>
      <Container hasTextAlign="centered">
        <HeaderLogo />
      </Container>
      <Container hasTextAlign="centered">
        Transfer all of your Toggl entries to Clockify.me
      </Container>
    </HeroBody>
  </Hero>
);

export default Header;
