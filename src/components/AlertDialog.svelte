<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { fade } from "svelte/transition";

  import Button from "~/components/Button.svelte";
  import FocusCapture from "~/components/FocusCapture.svelte";

  let className: string | undefined = undefined;
  export { className as class };

  const dispatchEvent = createEventDispatcher();

  let dialogElement: HTMLElement;

  function closeDialog(): void {
    dispatchEvent("close");
  }

  function handleWindowKeyDown(event: KeyboardEvent): void {
    if (event.code === "Escape" || event.code === "Enter") {
      closeDialog();
    }
  }
</script>

<svelte:window on:keydown={handleWindowKeyDown} />

<div data-backdrop transition:fade|local={{ duration: 250 }} />

<dialog
  bind:this={dialogElement}
  aria-modal={true}
  class={className}
  open={true}
  role="alertdialog"
  transition:fade={{ duration: 250 }}
>
  <FocusCapture parent={dialogElement}>
    <div role="document">
      <slot />

      <menu class="alignRight">
        <li>
          <Button variant="primary" on:click={closeDialog}>Close</Button>
        </li>
      </menu>
    </div>
  </FocusCapture>
</dialog>
