import React from "react";
import { styled } from "~/components";

const Base = styled.svg(
  {
    height: 96,
    width: 96,
    position: "absolute",
    top: "0.5rem",
    right: "0.5rem",
    zIndex: 10,

    circle: {
      strokeWidth: 24,
    },
  },
  ({ theme }) => ({
    circle: {
      fill: theme.colors.secondary,
      stroke: theme.colors.primary,
    },

    path: {
      fill: theme.colors.primary,
    },

    [theme.query.mobile]: {
      display: "flex",
      justifyContent: "center",
      height: 64,
      width: 64,
      top: "0.25rem",
      right: "0.25rem",
    },
  }),
);

/**
 * SVG rendering of official logo. The eyes are the Material Icon's "schedule"
 * icon and the mouth is the "undo" icon.
 * @see https://github.com/google/material-design-icons/blob/master/action/svg/production/ic_schedule_48px.svg
 * @see https://github.com/google/material-design-icons/blob/master/content/svg/production/ic_undo_48px.svg
 */
const Logo: React.FC = () => (
  <Base
    version="1.1"
    viewBox="0 0 480 480"
    role="presentation" // Hides the icon from screen readers
    aria-describedby="header-logo-desc"
    aria-labelledby="header-logo-title"
  >
    <title id="header-logo-title">transfermyti.me Logo</title>
    <desc id="header-logo-desc">
      A smiley face with clocks for eyes and an arrow for a mouth.
    </desc>
    <circle cx={240} cy={240} r={225} />
    <path d="M 217.27146 221.5816 C 239.40123 183.25172 226.25984 134.31684 187.92996 112.18707 C 149.60009 90.05731 100.65054 103.14398 78.52078 141.47386 C 56.39101 179.80373 69.49234 228.808 107.82222 250.93776 C 146.1521 273.06752 195.1417 259.91148 217.27146 221.5816 Z M 92.37582 149.51932 C 110.07963 118.85542 149.25529 108.35833 179.9192 126.06214 C 210.5831 143.76595 221.08018 182.94161 203.37637 213.60552 C 185.67255 244.26942 146.4969 254.7665 115.833 237.0627 C 85.16909 219.35888 74.672005 180.18322 92.37582 149.51932 Z M 180.56107 205.05812 L 186.56915 194.65182 L 144.94394 170.6195 L 102.08246 194.3899 L 107.59155 204.55436 L 144.13901 184.02984 Z" />
    <path d="M 237.514 364.651 C 261.86763 364.651 284.0575 355.5817 301.0452 340.7117 L 334.19193 373.85843 L 334.19193 290.99163 L 251.32513 290.99163 L 284.60996 324.27646 C 271.85768 335.0031 255.5145 341.63246 237.514 341.63246 C 204.87368 341.63246 177.25142 320.40935 167.58362 290.99163 L 145.80807 298.17342 C 158.46828 336.75252 194.69948 364.651 237.514 364.651 Z" />
    <path d="M 262.72854 221.5816 C 240.59877 183.25172 253.74016 134.31684 292.07004 112.18707 C 330.3999 90.05731 379.34946 103.14398 401.47922 141.47386 C 423.609 179.80373 410.50766 228.808 372.1778 250.93776 C 333.8479 273.06752 284.8583 259.91148 262.72854 221.5816 Z M 387.6242 149.51932 C 369.92037 118.85542 330.7447 108.35833 300.0808 126.06214 C 269.4169 143.76595 258.91982 182.94161 276.62363 213.60552 C 294.32745 244.26942 333.5031 254.7665 364.167 237.0627 C 394.8309 219.35888 405.328 180.18322 387.6242 149.51932 Z M 299.43893 205.05812 L 293.43085 194.65182 L 335.05606 170.6195 L 377.91754 194.3899 L 372.40845 204.55436 L 335.861 184.02984 Z" />
  </Base>
);

export default Logo;
