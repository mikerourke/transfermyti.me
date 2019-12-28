import React from "react";
import { styled, ExternalLink, Icon } from "~/components";

const Root = styled.footer({
  position: "absolute",
  right: 0,
  bottom: 0,
  left: 0,
  padding: "1rem 2rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
});

const Love = (): JSX.Element => <Icon name="heart" color="ruby" height={12} />;

const LinkToMe = (): JSX.Element => (
  <ExternalLink href="https://github.com/mikerourke">Mike Rourke</ExternalLink>
);

const LinkToIssues = (): JSX.Element => (
  <ExternalLink href="https://github.com/mikerourke/transfer-my-time/issues">
    in the GitHub repository
  </ExternalLink>
);

const Footer: React.FC = () => (
  <Root>
    <div>
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
    </div>
    <div css={{ fontSize: 13, fontWeight: 700, textAlign: "right" }}>
      <p>
        The time tracking tool companies (Clockify, Toggl, etc.) are not
        responsible for this tool.
      </p>
      <p>
        Please file any issues <LinkToIssues />.
      </p>
    </div>
  </Root>
);

export default Footer;
