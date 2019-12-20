import React from "react";
import { Column, Columns, Container, Footer as BloomerFooter } from "bloomer";
import styled from "@emotion/styled";
import { Icon } from "~/components";

const Root = styled(BloomerFooter)({
  position: "absolute",
  right: 0,
  bottom: 0,
  left: 0,
  height: "var(--footer-height)",
  display: "flex",
  alignItems: "center",
});

const Love = (): JSX.Element => <Icon name="heart" color="red" height={12} />;

const LinkToMe = (): JSX.Element => (
  <a
    href="https://github.com/mikerourke"
    target="_blank"
    rel="noopener noreferrer"
  >
    Mike Rourke
  </a>
);

const LinkToIssues = (): JSX.Element => (
  <a
    href="https://github.com/mikerourke/toggl-to-clockify-web/issues"
    target="_blank"
    rel="noopener noreferrer"
  >
    in the GitHub repository
  </a>
);

const Footer: React.FC = () => (
  <Root isPaddingless>
    <Container>
      <Columns isGapless isVCentered>
        <Column isSize="1/2">
          <p css={{ marginBottom: "0.5rem" }}>
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
          css={{ fontSize: 13, fontWeight: 700 }}
        >
          <p>FYI, Clockify is not responsible for this tool.</p>
          <p>
            Please file any issues <LinkToIssues />.
          </p>
        </Column>
      </Columns>
    </Container>
  </Root>
);

export default Footer;
