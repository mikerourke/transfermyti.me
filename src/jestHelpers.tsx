/* eslint-disable import/no-extraneous-dependencies,no-console */
import React from "react";
import {
  RenderOptions,
  RenderResult,
  render as testRender,
} from "@testing-library/react";
import { ThemeProvider } from "emotion-theming";
import { theme } from "./components/emotion";

// These are exported for convenience (so we don't have to add an additional import
// to the test file).
export { createEvent, fireEvent, RenderResult } from "@testing-library/react";
export { theme } from "./components/emotion";

/**
 * Renders the specified component with react-testing-library wrapped in a theme
 * provider so we don't have to do it explicitly for each component.
 */
export function render(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "queries">,
): RenderResult {
  return testRender(<ThemeProvider theme={theme}>{ui}</ThemeProvider>, options);
}

type LogMethod = "log" | "warn" | "error";

export class ConsoleToggle {
  private consoleMethod: (...args: AnyValid[]) => void = console.warn;
  private readonly logMethod: LogMethod;

  public constructor(logMethod: LogMethod) {
    this.logMethod = logMethod;
  }

  public onBefore(): void {
    this.consoleMethod = console[this.logMethod];
    console[this.logMethod] = jest.fn();
  }

  public onAfter(): void {
    console[this.logMethod] = this.consoleMethod;
  }
}
