declare function fetch(input: RequestInfo, init?: RequestInit): any;

declare module "promise-throttle";
declare module "redux-actions";
declare module "react-sweet-progress";

declare type VoidPromise = () => Promise<void>;

declare namespace jest {
  // @ts-ignore
  interface Matchers<R> {
    toBeInTheDocument(): R;
    toBeVisible(): R;
    toBeEmpty(): R;
    toBeDisabled(): R;
    toBeEnabled(): R;
    toBeInvalid(): R;
    toBeRequired(): R;
    toBeValid(): R;
    toContainElement(element: HTMLElement | SVGElement | null): R;
    toContainHTML(htmlText: string): R;
    toHaveAttribute(attr: string, value?: any): R;
    toHaveClass(...classNames: Array<string>): R;
    toHaveFocus(): R;
    toHaveFormValues(expectedValues: { [name: string]: any }): R;
    toHaveStyle(css: string): R;
    toHaveTextContent(
      text: string | RegExp,
      options?: { normalizeWhitespace: boolean },
    ): R;
    toHaveValue(value?: string | Array<string> | number): R;
  }
}
