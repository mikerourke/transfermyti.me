<script lang="ts">
  import { flip } from "svelte/animate";
  import { quintOut } from "svelte/easing";
  import { crossfade } from "svelte/transition";

  import { notificationsSelector } from "~/redux/app/appSelectors";
  import { select } from "~/redux/reduxToStore";

  import NotificationToast from "./NotificationToast.svelte";

  const [send, receive] = crossfade({
    duration: (d) => Math.sqrt(d * 200),

    fallback(node) {
      const style = getComputedStyle(node);

      const transform = style.transform === "none" ? "" : style.transform;

      return {
        duration: 600,
        easing: quintOut,
        css: (t) => `
          transform: ${transform} scale(${t});
          opacity: ${t}
        `,
      };
    },
  });

  const notifications = select(notificationsSelector);
</script>

<style>
  aside {
    position: absolute;
    top: calc(var(--height-header) + 48px);
    right: 0;
    bottom: var(--height-footer);
    overflow-y: auto;
    padding-right: 1rem;
    z-index: var(--z-index-notification);
  }

  ul,
  li {
    margin: 0;
    padding: 0;
  }

  li {
    list-style: none;
  }
</style>

<aside>
  <ul>
    {#each $notifications as notification (notification.id)}
      <li
        in:receive={{ key: notification.id }}
        out:send={{ key: notification.id }}
        animate:flip
      >
        <NotificationToast {notification} />
      </li>
    {/each}
  </ul>
</aside>
