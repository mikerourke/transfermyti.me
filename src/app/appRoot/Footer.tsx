import React from "react";
import { styled, ExternalLink, Icon } from "~/components";

const Root = styled.footer(
  {
    position: "fixed",
    right: 0,
    bottom: 0,
    left: 0,
    padding: "0 2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "5rem",

    p: {
      margin: 0,
    },
  },
  ({ theme }) => ({
    background: theme.colors.alto,
  }),
);

const RightColumn = styled.div({
  fontSize: 13,
  fontWeight: 700,
  textAlign: "right",
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
      <p>
        Made with
        <Love />
        by <LinkToMe />
      </p>
    </div>
    <RightColumn>
      <p>
        The time tracking tool companies (Clockify, Toggl, etc.) are not
        responsible for this tool.
      </p>
      <p>
        Please file any issues <LinkToIssues />.
      </p>
    </RightColumn>
  </Root>
);

export default Footer;
