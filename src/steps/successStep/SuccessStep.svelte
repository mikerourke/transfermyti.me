<script lang="ts">
  import { onMount } from "svelte";

  import {
    targetToolDisplayNameSelector,
    targetToolTrackerUrlSelector,
  } from "~/redux/allEntities/allEntitiesSelectors";
  import { credentialsFlushed } from "~/redux/credentials/credentialsActions";
  import { dispatchAction, selectorToStore } from "~/redux/reduxToStore";

  import Icon from "~/components/Icon.svelte";

  import BuyMeACoffeeButton from "./BuyMeACoffeeButton.svelte";

  const targetToolDisplayName = selectorToStore(targetToolDisplayNameSelector);

  const targetToolTrackerUrl = selectorToStore(targetToolTrackerUrlSelector);

  onMount(() => {
    dispatchAction(credentialsFlushed());
  });
</script>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  h1 {
    font-size: 3rem;
    margin: 2rem 0;
  }

  iframe {
    height: 315px;
    border: none;
    box-shadow: var(--elevation-dp8);
  }

  nav {
    margin: 3rem 0;
  }

  ul,
  li {
    margin: 0;
    padding: 0;
  }

  ul {
    display: flex;
  }

  li {
    list-style: none;
  }

  a {
    background-color: var(--color-primary);
    color: var(--color-secondary);
  }
</style>

<main>
  <h1>
    <span role="img" aria-label="Celebrate">🎉</span>
    All Done!
    <span role="img" aria-label="Celebrate">🎉</span>
  </h1>

  <iframe
    title="Thank you for being a friend"
    width={480}
    height={315}
    src="https://www.youtube.com/embed/dTmgL0XQehI"
    allow="accelerometer; encrypted-media"
    allowfullscreen
  />

  <nav>
    <ul>
      <li>
        <a
          href={$targetToolTrackerUrl}
          rel="noopener noreferrer"
          target="_blank"
          class="successButtonLink"
        >
          Go to {$targetToolDisplayName}

          <Icon
            name="openExternal"
            color="var(--color-secondary)"
            height={16}
            width={16}
            style="margin-left: 0.5rem;"
          />
        </a>
      </li>

      <li>
        <BuyMeACoffeeButton />
      </li>
    </ul>
  </nav>
</main>
