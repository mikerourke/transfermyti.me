import React from 'react';
import { css } from 'emotion';
import { Container, Content, Footer as BloomerFooter } from 'bloomer';
import SvgIcon, { SvgIconName } from '~/components/svgIcon/SvgIcon';

const Love = () => <SvgIcon name={SvgIconName.Heart} color="red" height={12} />;

const LinkToMe = () => (
  <a
    href="https://github.com/mikerourke"
    target="_blank"
    rel="noopener noreferrer"
  >
    Mike Rourke
  </a>
);

const Footer: React.FC = () => (
  <BloomerFooter
    className={css`
      flex-shrink: 0;
      padding: 1.5rem;
    `}
  >
    <Container>
      <Content>
        <p>
          Made with <Love /> by <LinkToMe />
        </p>
        <a
          href="https://twitter.com/codelikeawolf?ref_src=twsrc%5Etfw"
          className="twitter-follow-button"
          data-show-count="true"
        >
          Follow @codelikeawolf
        </a>
      </Content>
    </Container>
  </BloomerFooter>
);

export default Footer;
