<script lang="ts">
  import { onMount } from "svelte";

  import { notificationDismissed } from "~/modules/app/appActions";
  import { dispatchAction } from "~/redux/reduxToStore";
  import type { Notification } from "~/typeDefs";

  import Icon from "~/components/Icon.svelte";

  import classes from "./NotificationToast.module.css";

  export let notification: Notification;

  onMount(() => {
    setTimeout(dismiss, 5_000);
  });

  function dismiss(): void {
    dispatchAction(notificationDismissed(notification.id));
  }
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
    class={classes.navigationToastButton}
    aria-label="Dismiss the notification"
    on:click={dismiss}
  >
    <Icon name="close" color="var(--color-secondary)" width={18} height={18} />
  </button>
</div>
