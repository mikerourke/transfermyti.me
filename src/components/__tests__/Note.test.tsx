import React from "react";

import { render } from "~/jestHelpers";

import Note from "../Note";

describe("the <Note> component", () => {
  test("matches its snapshot with valid props", () => {
    const wrapper = render(<Note>Test Note</Note>);

    expect(wrapper.container.firstElementChild).toMatchSnapshot();
  });
});
