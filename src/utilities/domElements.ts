import { isNil } from "ramda";

export type ElementInput =
  | Document
  | Element
  | HTMLElement
  | Event
  | UIEvent
  | string
  | null
  | undefined;

type SetFocusOptions = {
  delay?: number;
  parent?: ElementInput;
  preventScroll?: boolean;
};

/**
 * Returns the value associated with the specified dataset entry name. If the
 * value doesn't exist, return null.
 * @param element Selector, element, or event to search dataset
 * @param propertyName Property name of the dataset to get value for
 */
export function datasetValue<T = string>(
  element: ElementInput,
  propertyName: string,
): T | null {
  const validElement = asElement(element);

  const value = validElement?.dataset[propertyName];

  return isNil(value) ? null : (value as unknown as T);
}

/**
 * Sets focus to the specified element. If a delay is specified, waits that
 * amount of time before trying to focus. This is required in some cases
 * because of transitions.
 * @param element Selector, element, or event to set focus
 * @param [options] Options for setting focus
 * @prop [options.delay=0] Amount of time in milliseconds to wait before attempting to set focus
 * @prop [options.parent=document] Parent element of the specified element
 * @prop [options.preventScroll=false] If true, don't scroll the focused element into view
 */
export function setFocusTo(
  element: ElementInput,
  options?: SetFocusOptions,
): void {
  const { delay = 0, parent = document, preventScroll = false } = options ?? {};

  setTimeout(() => {
    const validElement = asElement(element, parent);
    validElement?.focus({ preventScroll });
  }, delay);
}

/**
 * Returns an array of all focusable elements in the parent.
 * @see https://zellwk.com/blog/keyboard-focusable-elements/
 */
export function findAllFocusableElements(parent: ElementInput): HTMLElement[] {
  const focusableElements = findAll(
    `a, button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])`,
    parent,
  );

  return focusableElements.filter(
    (element) =>
      !element.hasAttribute("disabled") && isNil(element?.dataset?.guard),
  );
}

/**
 * Query the DOM for a specific element and return that element as the specified
 * type or null if not found.
 * @param selector CSS selector string to find the element
 * @param [parent] Optional parent element to perform search
 */
export function findOne<T = HTMLElement>(
  selector: string,
  parent?: ElementInput,
): T | null {
  const element = asElement(parent ?? document)?.querySelector(selector);

  if (!element) {
    return null;
  }

  return element as unknown as T;
}

/**
 * Query the DOM for the elements that match that selector and return as an
 * array.
 * @param selector CSS selector string to find the element
 * @param [parent=document] Optional parent element to perform search
 */
export function findAll<T = HTMLElement>(
  selector: string,
  parent?: ElementInput,
): T[] {
  try {
    const elements = asElement(parent ?? document)?.querySelectorAll(selector);

    if (!elements) {
      return [];
    }

    return nodeListToArray(elements);
  } catch {
    return [];
  }
}

/**
 * Returns an element (or null) based on the specified input and parent.
 */
export function asElement<T = HTMLElement>(
  element: ElementInput,
  parent?: ElementInput,
): T | null {
  if (isNil(element)) {
    return null;
  }

  let validElement;
  if (isValue(element)) {
    // CSS selector was passed in. Find the appropriate element in the DOM.
    let parentElement: HTMLElement | null = parent as HTMLElement;

    if (isEvent(parent)) {
      parentElement = parent.target as HTMLElement;
    } else if (isValue(parent)) {
      parentElement = document.querySelector(parent);
    } else if (isNil(parentElement)) {
      parentElement = document as unknown as HTMLElement;
    }

    validElement = parentElement?.querySelector(element) ?? null;
  } else if (isElementOrDocument(element)) {
    // The element is a valid HTML element or document, so we return it.
    validElement = element;
  } else if (isEvent(element)) {
    // The element was an event, so we extract the target and return it.
    validElement = element?.target ?? null;
  }

  return (validElement as unknown as T) ?? null;
}

function nodeListToArray<T = HTMLElement>(nodeList: NodeList): T[] {
  // @ts-ignore Shut up, this is correct.
  const elementArray = [...nodeList];

  return elementArray as unknown as T[];
}

function isElementOrDocument(
  value: ElementInput | number | boolean,
): value is Element | HTMLElement | Document {
  return (
    value instanceof Element ||
    value instanceof HTMLElement ||
    value instanceof Document
  );
}

function isEvent(value: ElementInput | number | boolean): value is UIEvent {
  return value instanceof UIEvent || !isNil((value as AnyValid)?.target);
}

function isValue(
  value: ElementInput | number | boolean,
): value is string | number | boolean {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}
