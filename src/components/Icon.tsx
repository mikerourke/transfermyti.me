import { ThemeColors } from "@emotion/react";
import React from "react";

export type IconName =
  | "circleAdd"
  | "circleRemove"
  | "github"
  | "heart"
  | "linkedIn"
  | "twitter";

export const iconAttributes = {
  // Source: https://github.com/google/material-design-icons/blob/master/content/svg/production/ic_add_circle_outline_48px.svg
  circleAdd: {
    viewBox: "0 0 48 48",
    desc: "A circle with a plus sign in the middle.",
    title: "Circle with Plus Sign Icon",
    path: [
      "M26 14h-4v8h-8v4h8v8h4v-8h8v-4h-8v-8zM24 4C12.95 4 4 12.95 4 24",
      "s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm0 36c-8.82 0-16-7.18-16-16S15.18",
      "8 24 8s16 7.18 16 16-7.18 16-16 16z",
    ].join(" "),
  },
  // Source: https://github.com/google/material-design-icons/blob/master/content/svg/production/ic_remove_circle_outline_48px.svg
  circleRemove: {
    viewBox: "0 0 48 48",
    desc: "A circle with a minus sign in the middle.",
    title: "Circle with Minus Sign Icon",
    path: [
      "M14 22v4h20v-4H14zM24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95",
      "20-20S35.05 4 24 4zm0 36c-8.82 0-16-7.18-16-16S15.18 8 24 8s16 7.18 16",
      "16-7.18 16-16 16z",
    ].join(" "),
  },
  // Source: https://github.com/FortAwesome/Font-Awesome/blob/master/svgs/brands/github.svg
  github: {
    viewBox: "0 0 496 512",
    desc: "A circle containing the GitHub octocat.",
    title: "GitHub Octocat Icon",
    path: [
      "M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6",
      "3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2",
      "s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6",
      "4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9z",
      "M244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3",
      "17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0",
      "0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9",
      "38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5",
      "0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6",
      "41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6",
      "67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17",
      "22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8",
      "496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7",
      "5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1z",
      "m-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7z",
      "m32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1z",
      "m-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z",
    ].join(" "),
  },
  heart: {
    viewBox: "0 0 1792 1536",
    desc: "A filled-in heart (the cartoon kind, not one with ventricles).",
    title: "Heart Icon",
    path: [
      "M896 1536q-26 0-44-18L228 916q-10-8-27.5-26 T145 824.5 77 727 23.5 606 0",
      "468q0-220 127-344T478 0 q62 0 126.5 21.5t120 58T820 148t76 68q36-36 76-68",
      "t95.5-68.5 120-58T1314 0q224 0 351 124t127 344 q0 221-229 450l-623",
      "600q-18 18-44 18z",
    ].join(" "),
  },
  // Source: https://github.com/FortAwesome/Font-Awesome/blob/master/svgs/brands/linkedin.svg
  linkedIn: {
    viewBox: "0 0 448 512",
    desc: "The LinkedIn logo",
    title: "LinkedIn Icon",
    path: [
      "M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416",
      "c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69",
      "V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96",
      "c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4",
      "V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2",
      "h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z",
    ].join(" "),
  },
  // Source: https://github.com/FortAwesome/Font-Awesome/blob/master/svgs/brands/twitter.svg
  twitter: {
    viewBox: "0 0 512 512",
    desc: "The Twitter bird logo",
    title: "Twitter Icon",
    path: [
      "M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583",
      "298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974",
      "16.568 1.299 25.34 1.299 49.055 0 94.213-16.568",
      "130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995",
      "1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985",
      "v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391",
      "0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365",
      "109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934",
      "104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32",
      "66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273",
      "41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z",
    ].join(" "),
  },
};

interface Props extends React.SVGAttributes<Omit<SVGElement, "color">> {
  name: IconName;
  color: keyof ThemeColors;
  size?: number;
}

/**
 * SVG icon that displays the path that corresponds with the specified `name`.
 * Note: The `<title>` and `<desc>` are used for accessibility.
 * @see https://www.sitepoint.com/tips-accessible-svg/
 */
const Icon: React.FC<Props> = ({ name, color, size = 24, ...props }) => {
  const svgDescId = `icon-${name}-desc`;
  const svgTitleId = `icon-${name}-title`;

  return (
    <svg
      version="1.1"
      viewBox={iconAttributes[name].viewBox}
      height={size}
      width={size}
      role="presentation" // Hides the icon from screen readers
      aria-describedby={svgDescId}
      aria-labelledby={svgTitleId}
      {...props}
    >
      <title id={svgTitleId}>{iconAttributes[name].title}</title>
      <desc id={svgDescId}>{iconAttributes[name].desc}</desc>
      <path
        data-testid="svg-icon-path"
        css={(theme) => ({ fill: theme.colors[color] })}
        d={iconAttributes[name].path}
      />
    </svg>
  );
};

export default Icon;
