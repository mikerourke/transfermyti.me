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
    isPaddingless
    className={css`
      position: absolute;
      right: 0;
      bottom: 0;
      left: 0;
      height: var(--footer-height);
      display: flex;
      align-items: center;
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
