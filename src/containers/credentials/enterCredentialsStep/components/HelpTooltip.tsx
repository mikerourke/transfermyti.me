import React from "react";
import { css } from "emotion";
import Tooltip from "~/components/tooltip/Tooltip";

interface Props {
  tipId: string;
  size?: number;
  color?: string;
}

const HelpTooltip: React.FC<Props> = ({ children, tipId, size, color }) => (
  <span
    className={css`
      margin-left: 8px;
    `}
  >
    <svg
      viewBox="929 882 46 46"
      width={size}
      height={size}
      data-tip
      data-for={tipId}
    >
      <g
        strokeOpacity={1}
        fillOpacity={1}
        strokeDasharray="none"
        fill="none"
        stroke="none"
      >
        <path
          d={`
            M 952 885
            C 940.95 885 932 893.95 932 905
            C 932 916.05 940.95 925 952 925
            C 963.05 925 972 916.05 972 905
            C 972 893.95 963.05 885 952 885
            Z
            M 954 919
            L 950 919
            L 950 915
            L 954 915
            Z
            M 958.13 903.51
            L 956.34 905.35
            C 954.9 906.79 954 908 954 911
            L 950 911
            L 950 910
            C 950 907.79 950.9 905.79 952.34 904.34
            L 954.83 901.82
            C 955.55 901.1 956 900.1 956 899
            C 956 896.79 954.21 895 952 895
            C 949.79 895 948 896.79 948 899
            L 944 899
            C 944 894.58 947.58 891 952 891
            C 956.42 891 960 894.58 960 899
            C 960 900.76 959.29 902.35 958.13 903.51
            Z
          `}
          fill={color}
        />
      </g>
    </svg>
    <Tooltip id={tipId}>{children}</Tooltip>
  </span>
);

HelpTooltip.defaultProps = {
  size: 16,
  color: "var(--info)",
};

export default HelpTooltip;
