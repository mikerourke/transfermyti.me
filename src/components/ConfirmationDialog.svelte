<script lang="ts">
  import clsx from "clsx";
  import { css } from "goober";
  import { createEventDispatcher } from "svelte";
  import { fade } from "svelte/transition";

  import Button from "~/components/Button.svelte";
  import FocusCapture from "~/components/FocusCapture.svelte";

  let className: string | undefined = undefined;
  export { className as class };

  const dispatchEvent = createEventDispatcher();

  let dialogElement: HTMLElement;

  function handleCancelClick(): void {
    dispatchEvent("cancel");
  }

  function handleConfirmClick(): void {
    dispatchEvent("confirm");
  }

  function handleWindowKeyDown(event: KeyboardEvent): void {
    if (event.code === "Escape") {
      event.preventDefault();

      handleCancelClick();
    }

    if (event.code === "Enter" && event.shiftKey) {
      event.preventDefault();

      handleConfirmClick();
    }
  }

  const styleClass = css`
    h2 {
      margin-bottom: 1rem;
      font-size: 1.75rem;
      font-weight: var(--font-weight-medium);
    }

    menu li button {
      width: 100%;
    }
  `;
</script>

<svelte:window on:keydown={handleWindowKeyDown} />

<div data-backdrop transition:fade|local={{ duration: 250 }} />

<dialog
  bind:this={dialogElement}
  aria-modal={true}
  class={clsx(styleClass, className)}
  open={true}
  {...$$restProps}
  transition:fade={{ duration: 250 }}
>
  <FocusCapture parent={dialogElement}>
    <div role="document">
      <slot />

      <menu class="alignRight">
        <li>
          <Button
            aria-label="Cancel and close the dialog"
            variant="secondary"
            on:click={handleCancelClick}
          >
            Cancel
          </Button>
        </li>

        <li>
          <Button
            aria-label="Perform the action and close the dialog"
            variant="eggplant"
            on:click={handleConfirmClick}
          >
            Confirm
          </Button>
        </li>
      </menu>
    </div>
  </FocusCapture>
</dialog>
