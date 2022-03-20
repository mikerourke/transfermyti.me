import React from "react";

import { render, RenderResult } from "~/jestHelpers";

import ExternalLink from "../ExternalLink";

const setup = (
  propOverrides: any = {},
): { props: any; wrapper: RenderResult } => {
  const props = {
    children: "Test Link",
    color: "navy",
    ...propOverrides,
  };

  const wrapper = render(<ExternalLink {...props} />);

  return { props, wrapper };
};

describe("the <ExternalLink> component", () => {
  test("matches its snapshot with valid props", () => {
    const { wrapper } = setup();

    expect(wrapper.container.firstElementChild).toMatchInlineSnapshot(
      `
      .emotion-0 {
        color: rgb(31, 58, 147);
      }

      .emotion-0:after {
        content: url("data:image/svg+xml;utf8,
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512' height='12px' width='12px'>
        <path d='M432,320H400a16,16,0,0,0-16,16V448H64V128H208a16,16,0,0,0,16-16V80 a16,16,0,0,0-16-16H48A48,48,0,0,0,0,112V464a48,48,0,0,0,48,48H400 a48,48,0,0,0,48-48V336A16,16,0,0,0,432,320ZM488,0h-128 c-21.37,0-32.05,25.91-17,41l35.73,35.73L135,320.37a24,24,0,0,0,0,34 L157.67,377a24,24,0,0,0,34,0L435.28,133.32,471,169 c15,15,41,4.5,41-17V24A24,24,0,0,0,488,0Z' fill='rgb(31, 58, 147)' fill-opacity='1'></path>
        </svg>
        ");
        margin: 0.25rem;
      }

      <a
        class="emotion-0"
        rel="noopener noreferrer"
        target="_blank"
      >
        Test Link
      </a>
    `,
    );
  });

  test("uses navy for the color if props.color is undefined", () => {
    const { wrapper } = setup({ color: undefined });

    expect(wrapper.container.firstElementChild).toMatchInlineSnapshot(
      `
      .emotion-0 {
        color: rgb(31, 58, 147);
      }

      .emotion-0:after {
        content: url("data:image/svg+xml;utf8,
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512' height='12px' width='12px'>
        <path d='M432,320H400a16,16,0,0,0-16,16V448H64V128H208a16,16,0,0,0,16-16V80 a16,16,0,0,0-16-16H48A48,48,0,0,0,0,112V464a48,48,0,0,0,48,48H400 a48,48,0,0,0,48-48V336A16,16,0,0,0,432,320ZM488,0h-128 c-21.37,0-32.05,25.91-17,41l35.73,35.73L135,320.37a24,24,0,0,0,0,34 L157.67,377a24,24,0,0,0,34,0L435.28,133.32,471,169 c15,15,41,4.5,41-17V24A24,24,0,0,0,488,0Z' fill='rgb(31, 58, 147)' fill-opacity='1'></path>
        </svg>
        ");
        margin: 0.25rem;
      }

      <a
        class="emotion-0"
        rel="noopener noreferrer"
        target="_blank"
      >
        Test Link
      </a>
    `,
    );
  });
});
