import React from "react";

import { ExternalLink, Icon, IconLink, styled } from "~/components";

const StyledFooter = styled.footer`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  height: var(--height-footer);
  padding: 2rem;
  background-color: var(--color-primary);
  color: var(--color-secondary);

  a {
    text-decoration: underline;
  }

  a:focus {
    outline-color: var(--color-secondary);
  }

  p {
    margin: 0;
  }

  nav {
    margin-top: 0.25rem;
  }

  ul {
    display: flex;
    padding: 0;
  }

  li {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  ul li:not(:last-of-type) {
    margin-right: 1rem;
  }

  > div:last-of-type {
    text-align: right;
    font-weight: var(--font-weight-medium);
  }

  @media (max-width: 32rem) {
    justify-content: center;

    nav {
      display: flex;
      justify-content: center;
    }

    > div:last-of-type {
      display: none;
    }
  }

  @media (min-width: 33rem) and (max-width: 52rem) {
    font-size: 14px;
  }
`;

const Footer: React.FC = () => (
  <StyledFooter>
    <div>
      {/* prettier-ignore */}
      <p>
        Made with <Icon name="heart" color="var(--color-ruby)" size={12} /> by <ExternalLink color="white" href="https://mikerourke.dev">Mike Rourke</ExternalLink> © {new Date().getFullYear()}
      </p>

      <nav aria-labelledby="footer-social-links">
        <h2 id="footer-social-links" className="visuallyHidden">
          Social Media Links
        </h2>

        <ul id="footer-social-links">
          <li>
            <IconLink
              href="https://github.com/mikerourke"
              iconName="github"
              color="white"
            >
              GitHub
            </IconLink>
          </li>

          <li>
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
        </ul>
      </nav>
    </div>

    <div>
      <p>The time tracking tool companies are not responsible for this tool.</p>

      {/* prettier-ignore */}
      <p>
        Please file any issues <ExternalLink color="white" href="https://github.com/mikerourke/transfermyti.me/issues">in the GitHub repository</ExternalLink>.
      </p>
    </div>
  </StyledFooter>
);

export default Footer;
