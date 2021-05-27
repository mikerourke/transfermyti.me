import * as R from "ramda";
import React from "react";

enum ElementKey {
  BoundaryStart = "boundaryStart",
  BoundaryEnd = "boundaryEnd",
  LastFocused = "lastFocused",
  FocusableFirst = "focusableFirst",
  FocusableLast = "focusableLast",
}

export function useModalAccessibility(
  isOpen: boolean,
  onClose: VoidFunction,
): void {
  const modalDelegatorRef = React.useRef<ModalDelegator>(
    new ModalDelegator(onClose),
  );

  /**
   * Ensures the modal closes when the user presses the "Escape" key.
   */
  const handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === "Escape" && isOpen) {
      onClose();
    }
  };

  React.useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      modalDelegatorRef.current.handleOpen();
    } else {
      modalDelegatorRef.current.handleClose();
    }
  }, [isOpen]);
}

/**
 * Manages tab controls within the modal to ensure it meets a11y requirements.
 * The approach taken to ensure a11y compliance was derived from the WAI-ARIA
 * practices guide v1.1 and corresponding example code.
 * @see https://www.w3.org/TR/wai-aria-practices-1.1/#dialog_modal
 * @see https://www.w3.org/TR/wai-aria-practices-1.1/examples/dialog-modal/dialog.html
 */
class ModalDelegator {
  private modalElement: HTMLElement | null;
  private elementsMap: Map<ElementKey, HTMLElement>;

  public constructor(private onCloseModal: VoidFunction) {
    this.elementsMap = new Map();
    this.modalElement = null;
  }

  public handleOpen(): void {
    this.modalElement = this.findModal();

    // Ensure we store a reference to the last element that had focus before
    // opening the modal. We'll need to set focus _back_ to it when the
    // modal is closed.
    const lastFocused = document.activeElement as HTMLElement;
    this.elementsMap.set(ElementKey.LastFocused, lastFocused);

    const [focusableFirst, focusableLast] = this.findFocusableElements();
    this.elementsMap.set(ElementKey.FocusableFirst, focusableFirst);
    this.elementsMap.set(ElementKey.FocusableLast, focusableLast);

    this.insertBoundaryElements();

    // Make sure we wait until the next event loop before attempting to set
    // focus:
    setTimeout(() => {
      if (focusableFirst) {
        focusableFirst.focus();
      }
    }, 0);
  }

  public handleClose(): void {
    this.removeBoundaryElements();

    // Set focus to the element that had focus before the modal was opened:
    const lastFocused = this.elementsMap.get(ElementKey.LastFocused);
    if (lastFocused) {
      lastFocused.focus();
    }

    this.onCloseModal();
  }

  private findModal(): HTMLElement {
    const modalNodeList = document.querySelectorAll("[aria-modal]");

    if (modalNodeList.length === 0) {
      throw new Error(
        "The modal must contain an element with the `aria-modal` attribute",
      );
    }

    if (modalNodeList.length > 1) {
      throw new Error(
        "Multiple elements found with the `aria-modal` attribute, only 1 is allowed",
      );
    }

    return modalNodeList.item(0) as HTMLElement;
  }

  /**
   * Finds the first and last focusable elements on the modal. If none are
   * found, throw an error.
   */
  private findFocusableElements(): [HTMLElement, HTMLElement] {
    // Types of elements that can receive focus:
    const focusableSelector = [
      "a[href]",
      "area[href]",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      "button:not([disabled])",
      '[tabindex]:not([tabindex^="-"])',
    ].join();

    const focusableNodeList = this.modal.querySelectorAll(
      focusableSelector,
    ) as NodeListOf<HTMLElement>;
    const nodeCount = focusableNodeList.length;

    if (nodeCount === 0) {
      throw new Error("The modal must contain at least one focusable element");
    }

    return [focusableNodeList.item(0), focusableNodeList.item(nodeCount - 1)];
  }

  /**
   * Adds a `<div>` element with a `tabindex` of 0 before and after the modal
   * element to redirect focus and limit focus to the modal.
   */
  private insertBoundaryElements(): void {
    // Adds the boundary element _before_ the modal element. If the element
    // receives focus, redirect focus to the first focusable element:
    if (!this.elementsMap.has(ElementKey.BoundaryStart)) {
      this.insertBoundaryElement(ElementKey.BoundaryStart, "afterbegin");
    }

    // Adds the boundary element _after_ the modal element. If the element
    // receives focus, redirect focus to the last focusable element:
    if (!this.elementsMap.has(ElementKey.BoundaryEnd)) {
      this.insertBoundaryElement(ElementKey.BoundaryEnd, "beforeend");
    }
  }

  /**
   * Per accessibility guidelines from the WAI-ARIA, the following Keyboard
   * Support rules apply:
   * Tab
   *  - Moves focus to next focusable element inside the dialog.
   *  - When focus is on the last focusable element in the dialog, moves focus
   *    to the first focusable element in the dialog.
   * Shift + Tab
   *  - Moves focus to previous focusable element inside the dialog.
   *  - When focus is on the first focusable element in the dialog, moves focus
   *    to the last focusable element in the dialog.
   */
  private handleWrapFocus = (event: FocusEvent): void => {
    const mapKey = (event.target as HTMLElement).getAttribute(
      "name",
    ) as ElementKey;
    let focusableKey = ElementKey.FocusableLast;
    if (mapKey === ElementKey.BoundaryStart) {
      focusableKey = ElementKey.FocusableFirst;
    }

    const focusableElement = this.elementsMap.get(focusableKey);
    if (focusableElement) {
      focusableElement.focus();
    }
  };

  private insertBoundaryElement(
    elementKey: ElementKey,
    insertPosition: InsertPosition,
  ): void {
    const boundaryElement = document.createElement("div");
    boundaryElement.setAttribute("tabindex", "0");
    boundaryElement.setAttribute("name", elementKey);
    boundaryElement.addEventListener("focus", this.handleWrapFocus);

    this.modal.insertAdjacentElement(insertPosition, boundaryElement);
    this.elementsMap.set(elementKey, boundaryElement);
  }

  private removeBoundaryElements(): void {
    const boundaryStart = this.elementsMap.get(ElementKey.BoundaryStart);
    if (boundaryStart) {
      this.elementsMap.delete(ElementKey.BoundaryStart);
      this.modal.removeChild(boundaryStart);
    }

    const boundaryEnd = this.elementsMap.get(ElementKey.BoundaryEnd);
    if (boundaryEnd) {
      this.elementsMap.delete(ElementKey.BoundaryEnd);
      this.modal.removeChild(boundaryEnd);
    }
  }

  public get modal(): HTMLElement {
    if (R.isNil(this.modalElement)) {
      throw new Error("Unable to find modal element");
    }

    return this.modalElement;
  }
}
