import React from "react";
import {
  ExternalLink,
  Icon,
  styled,
  VisuallyHidden,
  Flex,
  IconLink,
} from "~/components";

const Base = styled.footer(
  {
    alignItems: "center",
    display: "flex",
    height: "6rem",
    justifyContent: "space-between",
    padding: "0 2rem",
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
        by <LinkToMe />
      </p>
      <nav aria-labelledby="footer-social-links">
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
      </nav>
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
