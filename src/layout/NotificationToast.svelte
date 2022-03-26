<script lang="ts">
  import { css } from "goober";
  import { onMount } from "svelte";

  import { dismissNotification } from "~/modules/app/appActions";
  import { dispatchAction } from "~/redux/reduxToStore";
  import type { NotificationModel } from "~/typeDefs";

  import Icon from "~/components/Icon.svelte";

  export let notification: NotificationModel;

  onMount(() => {
    setTimeout(dismiss, 5_000);
  });

  function dismiss(): void {
    dispatchAction(dismissNotification(notification.id));
  }

  const buttonStyleClass = css`
    position: absolute;
    top: 0.375rem;
    right: 0.5rem;
    margin: 0;
    padding: 0;
    background-color: transparent;
    color: var(--color-white);
    line-height: 1;

    path {
      fill: var(--color-white);
      stroke: var(--color-white);
    }

    &:hover path {
      stroke: var(--color-white);
      stroke-width: 4;
      transition: all var(--duration-short) var(--transition-function);
    }
  `;
</script>

<style>
  [role="status"] {
    position: relative;
    display: flex;
    gap: 1rem;
    width: 20rem;
    margin: 1rem 0.5rem 0 0;
    padding: 1rem;
    border-radius: 0.375rem;
    color: var(--color-white);
    font-weight: var(--font-weight-medium);
    box-shadow: var(--elevation-dp2);
    letter-spacing: -0.375px;
    z-index: var(--z-index-notification);
  }

  .error {
    background-color: var(--color-ruby);
  }

  .success {
    background-color: var(--color-green);
  }
</style>

<div
  role="status"
  class:error={notification.type === "error"}
  class:success={notification.type === "success"}
>
  {notification.message}

  <button
    class={buttonStyleClass}
    aria-label="Dismiss the notification"
    on:click={dismiss}
  >
    <Icon name="close" color="var(--color-secondary)" width={18} height={18} />
  </button>
</div>
