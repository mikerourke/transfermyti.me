import emotionStyled, { CreateStyled } from "@emotion/styled";
import { useTheme as emotionUseTheme } from "emotion-theming";

/**
 * Some of the colors were taken from A11y Style Guide.
 * @see https://a11y-style-guide.com/style-guide/section-general.html#kssref-general-colors
 */
export interface ThemeColors {
  primary: string;
  secondary: string;
  ruby: string;
  navy: string;
  eggplant: string;
  error: string;
  success: string;
  black: string;
  midnight: string;
  manatee: string;
  silver: string;
  alto: string;
  alabaster: string;
  white: string;
  clockifyBlue: string;
  togglRed: string;
}

export interface Theme {
  readonly breakpoints: string[];
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
}

export const theme: Theme = {
  breakpoints: ["40em", "52em", "64em"],
  colors: {
    primary: "rgb(30, 120, 161)",
    secondary: "rgb(239, 253, 232)",
    ruby: "rgb(165, 19, 35)",
    navy: "rgb(31, 58, 147)",
    eggplant: "rgb(85, 0, 85)",
    error: "rgb(224, 0, 0)",
    success: "rgb(33, 128, 3)",
    black: "rgb(56, 56, 56)",
    midnight: "rgb(72, 72, 72)",
    silver: "rgb(88, 88, 88)",
    manatee: "rgb(136, 136, 136)",
    alto: "rgb(224, 224, 224)",
    alabaster: "rgb(248, 248, 248)",
    white: "rgb(255, 255, 255)",
    clockifyBlue: "rgb(76, 166, 238)",
    togglRed: "rgb(207, 72, 70)",
  },
  fonts: {
    body: `"Apple-System", Arial, Helvetica, sans-serif`,
    heading: "inherit",
    monospace: "monospace",
  },
  fontWeights: {
    body: 400,
    bold: 600,
    heading: 700,
  },
  lineHeights: {
    body: 1.5,
    heading: 1.25,
  },
  elevation: {
    dp1: `0 1px 3px 0 rgba(0, 0, 0, 0.2),
      0 1px 1px 0 rgba(0, 0, 0, 0.14),
      0 2px 1px -1px rgba(0, 0, 0, 0.12)`,
    dp2: `0 1px 5px 0 rgba(0, 0, 0, 0.2),
      0 2px 2px 0 rgba(0, 0, 0, 0.14),
      0 3px 1px -2px rgba(0, 0, 0, 0.12)`,
    dp4: `0 2px 4px -1px rgba(0, 0, 0, 0.2),
      0 4px 5px 0 rgba(0, 0, 0, 0.14),
      0 1px 10px 0 rgba(0, 0, 0, 0.12)`,
    dp8: `0 5px 5px -3px rgba(0, 0, 0, 0.2),
      0 8px 10px 1px rgba(0, 0, 0, 0.14),
      0 3px 14px 2px rgba(0, 0, 0, 0.12)`,
    dp16: `0 8px 10px -5px rgba(0, 0, 0, 0.2), 
      0 16px 24px 2px rgba(0, 0, 0, 0.14),
      0 6px 30px 5px rgba(0, 0, 0, 0.12)`,
  },
};

export const styled = emotionStyled as CreateStyled<Theme>;

export const useTheme = (): Theme => emotionUseTheme<Theme>();
