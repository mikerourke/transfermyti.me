/// <reference types="@emotion/react/types/css-prop" />

import "@emotion/react";

declare module "@emotion/react" {
  /**
   * Some of the colors were taken from A11y Style Guide.
   * @see https://a11y-style-guide.com/style-guide/section-general.html#kssref-general-colors
   */
  export interface ThemeColors {
    readonly primary: string;
    readonly secondary: string;
    readonly ruby: string;
    readonly navy: string;
    readonly eggplant: string;
    readonly error: string;
    readonly success: string;
    readonly black: string;
    readonly midnight: string;
    readonly manatee: string;
    readonly silver: string;
    readonly alto: string;
    readonly alabaster: string;
    readonly white: string;
    readonly clockifyBlue: string;
    readonly togglRed: string;
  }

  export interface Theme {
    readonly colors: ThemeColors;
    readonly fonts: {
      readonly body: string;
      readonly heading: string;
      readonly monospace: string;
    };
    readonly fontWeights: {
      readonly body: number;
      readonly bold: number;
      readonly heading: number;
    };
    readonly lineHeights: {
      readonly body: number;
      readonly heading: number;
    };
    readonly elevation: {
      readonly dp1: string;
      readonly dp2: string;
      readonly dp4: string;
      readonly dp8: string;
      readonly dp16: string;
    };
    readonly sizes: {
      notificationHeight: number;
      notificationGap: number;
    };
    readonly query: {
      mobile: string;
      small: string;
    };
  }
}
