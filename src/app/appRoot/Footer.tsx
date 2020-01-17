import React from "react";
import {
  ExternalLink,
  Flex,
  Icon,
  IconLink,
  styled,
  VisuallyHidden,
} from "~/components";

const Base = styled.footer(
  {
    display: "flex",
    height: "7rem",
    justifyContent: "space-between",
    padding: "2rem",
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,

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

    [theme.query.mobile]: {
      justifyContent: "center",
    },

    [theme.query.small]: {
      fontSize: 14,
    },

    "a:focus": {
      outlineColor: theme.colors.secondary,
    },
  }),
);

const RightColumn = styled.div({
  fontWeight: 500,
  textAlign: "right",

  "@media (max-width: 32rem)": {
    display: "none",
  },
});

const SocialLinksNav = styled.nav(
  {
    marginTop: "0.25rem",
  },
  ({ theme }) => ({
    [theme.query.mobile]: {
      display: "flex",
      justifyContent: "center",
    },
  }),
);

const Love: React.FC = () => <Icon name="heart" color="ruby" height={12} />;

const LinkToMe: React.FC = () => (
  <ExternalLink color="white" href="https://mikerourke.dev">
    Mike Rourke
  </ExternalLink>
);

const LinkToIssues: React.FC = () => (
  <ExternalLink
    color="white"
    href="https://github.com/mikerourke/transfermyti.me/issues"
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
        by <LinkToMe /> © {new Date().getFullYear()}
      </p>
      <SocialLinksNav aria-labelledby="footer-social-links">
        <VisuallyHidden id="footer-social-links">
          Social Media Links
        </VisuallyHidden>
        <Flex
          as="ul"
          id="footer-social-links"
          css={{ listStyle: "none", padding: 0 }}
        >
          <li css={{ marginRight: "1rem" }}>
            <IconLink
              href="https://github.com/mikerourke"
              iconName="github"
              color="white"
            >
              GitHub
            </IconLink>
          </li>
          <li css={{ marginRight: "1rem" }}>
            <IconLink
              href="https://www.linkedin.com/in/michaelwrourke"
              iconName="linkedIn"
              color="white"
            >
              LinkedIn
            </IconLink>
          </li>
          <li>
            <IconLink
              href="https://twitter.com/codelikeawolf"
              iconName="twitter"
              color="white"
            >
              Twitter
            </IconLink>
          </li>
        </Flex>
      </SocialLinksNav>
    </div>
    <RightColumn>
      <p>The time tracking tool companies are not responsible for this tool.</p>
      <p>
        Please file any issues <LinkToIssues />.
      </p>
    </RightColumn>
  </Base>
);

export default Footer;
