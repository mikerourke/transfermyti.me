import React from "react";
import cuid from "cuid";
import { ThemeColors } from "./emotion";

export type IconName = "circleAdd" | "circleRemove" | "github" | "heart";

export const iconAttributes = {
  circleAdd: {
    viewBox: "0 0 48 48",
    desc: "A circle with a plus sign in the middle.",
    title: "Circle with plus sign",
    path: `
      M26 14h-4v8h-8v4h8v8h4v-8h8v-4h-8v-8zM24 4C12.95 4 4 12.95 4 24
      s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm0 36c-8.82 0-16-7.18-16-16S15.18 
      8 24 8s16 7.18 16 16-7.18 16-16 16z`,
  },
  circleRemove: {
    viewBox: "0 0 48 48",
    desc: "A circle with a minus sign in the middle.",
    title: "Circle with minus sign",
    path: `
      M14 22v4h20v-4H14zM24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 
      20-20S35.05 4 24 4zm0 36c-8.82 0-16-7.18-16-16S15.18 8 24 8s16 7.18 16 
      16-7.18 16-16 16z`,
  },
  github: {
    viewBox: "0 0 1024 998",
    desc: "A circle containing the GitHub octocat.",
    title: "GitHub octocat icon",
    path: `
      M0 512q0 166 95.5 298.5T343 996q6 1 10 1t6.5-1.5 4-3 2-5 .5-4.5
      V882q-37 4-66-.5t-45.5-14-29-23.5-17-25.5-9-24T194 780q-9-15-27-27.5
      t-27-20-2-14.5q50-26 113 66 34 51 119 30 10-41 40-70-116-21-172-86
      t-56-158q0-87 55-151-22-65 6-137 29-2 65 11.5t50.5 23T384 264
      q57-16 128.5-16T642 264q13-9 29-19t49-21.5 61-9.5
      q27 71 6 135 56 64 56 152 0 92-56.5 157.5T615 744
      q43 43 43 104v129q0 1 1 3 0 6 .5 9t4.5 6 11 3q154-52 251.5-185.5
      T1024 512q0-104-40.5-199t-109-163.5T711 40.5 512 0 313 40.5
      t-163.5 109T40.5 313 0 512z`,
  },
  heart: {
    viewBox: "0 0 1792 1536",
    desc: "A heart",
    title: "Heart",
    path: `
      M896 1536q-26 0-44-18L228 916q-10-8-27.5-26 T145 824.5 77 727 23.5 606 0 
      468q0-220 127-344T478 0 q62 0 126.5 21.5t120 58T820 148t76 68q36-36 76-68 
      t95.5-68.5 120-58T1314 0q224 0 351 124t127 344 q0 221-229 450l-623 
      600q-18 18-44 18z`,
  },
};

interface Props extends React.SVGAttributes<SVGElement> {
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
  const svgId = cuid();
  return (
    <svg
      version="1.1"
      viewBox={iconAttributes[name].viewBox}
      height={size}
      width={size}
      role="presentation" // Hides the icon from screen readers
      aria-describedby={`${svgId}-desc`}
      aria-labelledby={`${svgId}-title`}
      {...props}
    >
      <title id={`${svgId}-title`}>{iconAttributes[name].title}</title>
      <desc id={`${svgId}-desc`}>{iconAttributes[name].desc}</desc>
      <path
        data-testid="svg-icon-path"
        d={iconAttributes[name].path}
        css={theme => ({ fill: theme.colors[color] })}
      />
    </svg>
  );
};

export default Icon;
