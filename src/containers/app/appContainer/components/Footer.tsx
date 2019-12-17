import React from "react";
import { css } from "emotion";
import { Column, Columns, Container, Footer as BloomerFooter } from "bloomer";
import SvgIcon, { SvgIconName } from "~/components/svgIcon/SvgIcon";

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

const LinkToIssues = () => (
  <a
    href="https://github.com/mikerourke/toggl-to-clockify-web/issues"
    target="_blank"
    rel="noopener noreferrer"
  >
    in the GitHub repository
  </a>
);

const Footer: React.FC = () => (
  <BloomerFooter
    isPaddingless
    className={css({
      position: "absolute",
      right: 0,
      bottom: 0,
      left: 0,
      height: "var(--footer-height)",
      display: "flex",
      alignItems: "center",
    })}
  >
    <Container>
      <Columns isGapless isVCentered>
        <Column isSize="1/2">
          <p className={css({ marginBottom: "0.5rem" })}>
            Made with <Love /> by <LinkToMe />
          </p>
          <a
            href="https://twitter.com/codelikeawolf?ref_src=twsrc%5Etfw"
            className="twitter-follow-button"
            data-show-count="true"
          >
            Follow @codelikeawolf
          </a>
        </Column>
        <Column
          isSize="1/2"
          hasTextAlign="right"
          className={css({ fontSize: 13, fontWeight: 700 })}
        >
          <p>FYI, Clockify is not responsible for this tool.</p>
          <p>
            Please file any issues <LinkToIssues />.
          </p>
        </Column>
      </Columns>
    </Container>
  </BloomerFooter>
);

export default Footer;
