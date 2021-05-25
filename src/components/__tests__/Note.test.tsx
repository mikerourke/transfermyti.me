import React from "react";

import Note from "../Note";
import { render } from "~/jestHelpers";

describe("the <Note> component", () => {
  test("matches its snapshot with valid props", () => {
    const wrapper = render(<Note>Test Note</Note>);

    expect(wrapper.container.firstElementChild).toMatchSnapshot();
  });
});
