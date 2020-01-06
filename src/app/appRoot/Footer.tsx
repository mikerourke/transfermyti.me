import React from "react";
import { ExternalLink, Icon, styled } from "~/components";

const Base = styled.footer(
  {
    position: "fixed",
    right: 0,
    bottom: 0,
    left: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "5rem",
    padding: "0 2rem",

    a: {
      textDecoration: "underline",
    },

    p: {
      margin: 0,
    },
  },
  ({ theme }) => ({
    background: theme.colors.primary,
    color: theme.colors.secondary,

    "a:focus": {
      outlineColor: theme.colors.secondary,
    },
  }),
);

const RightColumn = styled.div({
  fontSize: 14,
  fontWeight: 500,
  textAlign: "right",
});

const Love: React.FC = () => <Icon name="heart" color="ruby" height={12} />;

const LinkToMe: React.FC = () => (
  <ExternalLink color="white" href="https://github.com/mikerourke">
    Mike Rourke
  </ExternalLink>
);

const LinkToIssues: React.FC = () => (
  <ExternalLink
    color="white"
    href="https://github.com/mikerourke/transfer-my-time/issues"
  >
    in the GitHub repository
  </ExternalLink>
);

const Footer: React.FC = () => (
  <Base>
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
  </Base>
);

export default Footer;
