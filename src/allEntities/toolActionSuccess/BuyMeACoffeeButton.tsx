import Color from "color";
import React from "react";

import { styled, getOpenInNewTabContent } from "~/components";

const Anchor = styled.a(
  {
    alignItems: "center",
    backgroundColor: "#bd5fff",
    border: "1px solid transparent",
    borderRadius: "0.375rem",
    display: "inline-flex",
    fontSize: "1.25rem",
    height: "3.25rem",
    minWidth: "15rem",
    padding: "0.5rem 0.75rem",
    textDecoration: "none",
    transition: "0.3s all linear",
  },
  ({ theme }) => ({
    color: theme.colors.white,

    "&:hover": {
      background: Color("#bd5fff").darken(0.1).hex(),
    },

    "&:after": {
      content: getOpenInNewTabContent(theme.colors.white),
      margin: "0.25rem",
    },
  }),
);

const LogoSvg = styled.svg({
  border: "none",
  boxShadow: "none",
  marginBottom: 1,
  verticalAlign: "middle",
});

/**
 * This is the logo for the Buy me a coffee site. I converted it to SVG (rather
 * than use an `<img>` element) for a11y purposes.
 * @see https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg
 */
const CoffeeLogo: React.FC = () => (
  <LogoSvg width={24} height={36} viewBox="0 0 24 36">
    <title>Coffee Cup</title>
    <desc>Disposable coffee cup with lid</desc>
    <g stroke="none" strokeWidth={1} fill="none" fillRule="evenodd">
      <g transform="translate(-17, -7)">
        <g transform="translate(17, 8)">
          <g transform="translate(0.559947, 0)">
            <polygon
              fill="#FF9100"
              points="11.2752139 6.65517263 2.53594776 6.60250871 6.82755165 33.7158335 7.76390159 33.7158335 16.3471094 33.7158335 17.2834593 33.7158335 21.5750632 6.60250871"
            />
            <polygon
              fill="#FFDD00"
              points="11.2752139 6.65517263 2.53594776 6.60250871 6.82755165 33.7158335 7.76390159 33.7158335 14.1622929 33.7158335 15.0986428 33.7158335 19.3902467 6.60250871"
            />
            <polygon
              fill="#FFFFFF"
              points="0.0390145809 6.60252433 22.5894423 6.60252433 22.5894423 4.10216009 0.0390145809 4.10216009"
            />
            <polygon
              stroke="#000000"
              strokeWidth="1.17043743"
              points="0.0390145809 6.60252433 22.5894423 6.60252433 22.5894423 4.10216009 0.0390145809 4.10216009"
            />
            <polygon
              fill="#FFFFFF"
              points="18.2198093 0.0390681913 12.8357971 0.0390681913 9.63660147 0.0390681913 4.25258931 0.0390681913 2.61397692 3.78961456 9.63660147 3.78961456 12.8357971 3.78961456 19.8584217 3.78961456"
            />
            <g
              transform="translate(0.936350, 0.000000)"
              strokeWidth="1.17043743"
            >
              <polygon
                stroke="#050505"
                points="17.2834593 0.0390681913 11.8994472 0.0390681913 8.70025153 0.0390681913 3.31623937 0.0390681913 1.67762698 3.78961456 8.70025153 3.78961456 11.8994472 3.78961456 18.9220717 3.78961456"
              />
              <polygon
                stroke="#000000"
                points="10.3388639 6.65517263 0.0390145809 6.60250871 4.33061848 33.7158335 5.26696842 33.7158335 15.4107594 33.7158335 16.3471094 33.7158335 20.6387133 6.60250871"
              />
            </g>
            <polygon
              fill="#FFFFFF"
              points="21.8871799 14.2598898 11.6059795 14.2598898 10.8664191 14.2598898 0.585218713 14.2598898 2.50832543 25.0427106 11.2361993 24.9487126 19.9640731 25.0427106"
            />
            <polygon
              stroke="#000000"
              strokeWidth="1.17043743"
              points="21.8871799 14.2598898 11.6059795 14.2598898 10.8664191 14.2598898 0.585218713 14.2598898 2.50832543 25.0427106 11.2361993 24.9487126 19.9640731 25.0427106"
            />
          </g>
        </g>
      </g>
    </g>
  </LogoSvg>
);

const BuyMeACoffeeButton: React.FC = () => (
  <Anchor target="_blank" href="https://www.buymeacoffee.com/mikerourke">
    <CoffeeLogo />
    <span css={{ fontSize: "1.25rem", marginLeft: "1rem" }}>
      Buy me a coffee
    </span>
  </Anchor>
);

export default BuyMeACoffeeButton;
