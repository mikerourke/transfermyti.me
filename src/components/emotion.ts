import emotionStyled, { CreateStyled } from "@emotion/styled";
import { useTheme as emotionUseTheme } from "emotion-theming";

/**
 * Colors were taken from a11y style guide (except for "black" and "white", I'm
 * using a slight variation for those).
 * @see https://a11y-style-guide.com/style-guide/section-general.html#kssref-general-colors
 */
export interface ThemeColors {
  ruby: string;
  seaglass: string;
  grass: string;
  cornflower: string;
  navy: string;
  eggplant: string;
  error: string;
  success: string;
  black: string;
  midnight: string;
  manatee: string;
  silver: string;
  alto: string;
  gallery: string;
  alabaster: string;
  white: string;
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
    ruby: "#a51323",
    seaglass: "#7fffd4",
    grass: "#42dc42",
    cornflower: "#4083ae",
    navy: "#0a3055",
    eggplant: "#550055",
    error: "#e00000",
    success: "#218003",
    black: "rgb(56, 56, 56)",
    midnight: "#464646",
    manatee: "#888b8d",
    silver: "#bbbbbb",
    alto: "#dddddd",
    gallery: "#f4f4f4",
    alabaster: "#f7f7f7",
    white: "#fff",
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
