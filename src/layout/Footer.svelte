<script lang="ts">
  import ExternalLink from "~/components/ExternalLink.svelte";
  import Icon from "~/components/Icon.svelte";
  import IconLink from "~/components/IconLink.svelte";

  import classes from "./Footer.module.css";

  const iconSize = { height: 18, width: 18 };
</script>

<style>
  footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: var(--height-footer);
    padding: 0 2rem;
    background-color: var(--color-primary);
    color: var(--color-secondary);
  }

  p {
    margin: 0;
    font-size: 0.9rem;
  }

  nav {
    margin-top: 0.25rem;
  }

  ul,
  li {
    padding: 0;
  }

  ul {
    display: flex;
    gap: 1rem;
  }

  li {
    list-style: none;
  }

  footer div:last-of-type {
    text-align: right;
    font-weight: 500;
  }

  @media (max-width: 32rem) {
    footer {
      justify-content: center;
    }

    nav {
      display: flex;
      justify-content: center;
    }

    footer div:last-of-type {
      display: none;
    }
  }

  @media (min-width: 33rem) and (max-width: 52rem) {
    footer {
      font-size: 14px;
    }
  }
</style>

<footer class={classes.footer}>
  <div>
    <p>
      Made with <Icon name="heart" color="var(--color-ruby)" height={12} />
      by <ExternalLink href="https://mikerourke.dev">Mike Rourke</ExternalLink>
      © {new Date().getFullYear()}
    </p>

    <nav aria-label="Social Media Links">
      <ul>
        <li>
          <IconLink
            aria-label="GitHub Profile"
            iconName="github"
            href="https://github.com/mikerourke"
            {...iconSize}
          />
        </li>

        <li>
          <IconLink
            aria-label="LinkedIn Profile"
            iconName="linkedIn"
            href="https://www.linkedin.com/in/michaelwrourke"
            {...iconSize}
          />
        </li>

        <li>
          <IconLink
            aria-label="Twitter Profile"
            iconName="twitter"
            href="https://twitter.com/codelikeawolf"
            {...iconSize}
          />
        </li>
      </ul>
    </nav>
  </div>

  <div>
    <p>The time tracking tool companies are not responsible for this tool.</p>

    <!-- prettier-ignore -->
    <p>
      Please file any issues
      <ExternalLink href="https://github.com/mikerourke/transfermyti.me/issues">in the GitHub repository</ExternalLink>.
    </p>
  </div>
</footer>
