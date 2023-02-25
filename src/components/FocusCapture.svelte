<script lang="ts">
  import { onMount } from "svelte";

  import {
    asElement,
    datasetValue,
    findAllFocusableElements,
    setFocusTo,
    type ElementInput,
  } from "~/utilities/domElements";

  type FocusGuardsLocation = "start" | "end" | "both";

  /**
   * The <FocusCapture> component ensures the child content adheres to a11y
   * guidelines for form/modal navigation. When you reach the last element in a
   * form or modal and press Tab, the first element in the form should be focused.
   * Pressing Shift + Tab when the first element is active should set focus to
   * the last element in the captured region. If we didn't do this, pressing Tab
   * or Shift + Tab in a modal may set focus to some other element in the DOM
   * outside the modal that may be impossible to see visually.
   */

  /**
   * Specify which tab guards to use for accessible form navigation.
   *
   * start: The focus will go back to the last focusable element in the form
   *        after shift tabbing from the first focusable element in the form.
   *
   * end:   The focus will go back to the first focusable element in the form
   *        after tabbing from the last focusable element in the form.
   *
   * both:  Performs both the "start" and "end" behaviors.
   */
  export let guards: FocusGuardsLocation = "both";

  /**
   * Specifying a parent element ensures you don't get caught in a different
   * capture region somewhere in the DOM.
   */
  export let parent: ElementInput;

  /**
   * If true, sets focus back to the element that was focused prior to entering
   * the capture region.
   */
  export let resetFocus: boolean = true;

  /**
   * Indicates which element to start at within the captured region.
   */
  export let startAt: "first" | "last" = "first";

  onMount(() => {
    const lastActiveElement = asElement(document.activeElement);

    if (startAt === "first") {
      setFocusTo(`[data-guard="end"]`);
    } else {
      setFocusTo(`[data-guard="start"]`);
    }

    return () => {
      if (resetFocus) {
        setFocusTo(lastActiveElement);
      }
    };
  });

  function handleFocusGuard(event: FocusEvent): void {
    const guardLocation = datasetValue(event, "guard");

    const focusableElements = findAllFocusableElements(parent);

    let focusToElement: HTMLElement;
    if (guardLocation === "end") {
      focusToElement = focusableElements[0];
    } else {
      focusToElement = focusableElements[focusableElements.length - 1];
    }

    setFocusTo(focusToElement);
  }
</script>

{#if guards === "start" || guards === "both"}
  <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
  <div
    data-guard="start"
    class="visuallyHidden"
    tabindex="0"
    on:focus={handleFocusGuard}
  />
{/if}

<slot />

{#if guards === "end" || guards === "both"}
  <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
  <div
    data-guard="end"
    class="visuallyHidden"
    tabindex="0"
    on:focus={handleFocusGuard}
  />
{/if}
