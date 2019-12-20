import React from "react";
import cases from "jest-in-case";
import { fireEvent, render } from "@testing-library/react";
import StepPage from "../StepPage";

const setup = (propOverrides: any = {}) => {
  const props = {
    stepNumber: 1,
    instructions: "TEST INSTRUCTIONS",
    subtitle: "TEST SUBTITLE",
    isNextLoading: false,
    onNextClick: jest.fn(),
    onPreviousClick: jest.fn(),
    onRefreshClick: jest.fn(),
    onResize: jest.fn(),
    ...propOverrides,
  };

  const wrapper = render(<StepPage {...props} />);

  return { wrapper, props };
};

describe("<StepPage> Component", () => {
  test("shows the correct title and subtitle", () => {
    const {
      wrapper: { getByTestId },
      props,
    } = setup();

    expect(getByTestId("page-header-title")).toHaveTextContent(
      `Step ${props.stepNumber}`,
    );
    expect(getByTestId("page-header-subtitle")).toHaveTextContent(
      props.subtitle,
    );
  });

  cases(
    "does not display the correct components based on props",
    options => {
      const { queryByTestId } = setup(options.propsOverride).wrapper;
      expect(queryByTestId(options.testId)).toBeNull();
    },
    [
      {
        name: "instructions not shown if props.instructions is undefined",
        propsOverride: { instructions: undefined },
        testId: "instructions-section",
      },
      {
        name: "Refresh button not shown if props.onRefreshClick is undefined",
        propsOverride: { onRefreshClick: undefined },
        testId: "step-page-refresh-button",
      },
      {
        name: "Previous button not shown if props.onPreviousClick is undefined",
        propsOverride: { onPreviousClick: undefined },
        testId: "step-page-previous-button",
      },
      {
        name: "button separator not shown if props.onNextClick is undefined",
        propsOverride: { onNextClick: undefined },
        testId: "step-page-button-separator",
      },
      {
        name:
          "button separator not shown if props.onPreviousClick is undefined",
        propsOverride: { onPreviousClick: undefined },
        testId: "step-page-button-separator",
      },
      {
        name: "Next button not shown if props.onNextClick is undefined",
        propsOverride: { onNextClick: undefined },
        testId: "step-page-next-button",
      },
    ],
  );

  test("shows the Next button as loading when props.isLoading = true", () => {
    const { getByTestId } = setup({ isNextLoading: true }).wrapper;

    expect(getByTestId("step-page-next-button")).toHaveClass("is-loading");
  });

  cases(
    "fires the correct prop function when a button is clicked",
    ({ testId, funcName }) => {
      const {
        wrapper: { queryByTestId },
        props,
      } = setup();
      fireEvent.click(queryByTestId(testId));

      expect(props[funcName]).toHaveBeenCalled();
    },
    [
      {
        name: "fires props.onRefreshClick when Refresh button is clicked",
        funcName: "onRefreshClick",
        testId: "step-page-refresh-button",
      },
      {
        name: "fires props.onPreviousClick when Previous button is clicked",
        funcName: "onPreviousClick",
        testId: "step-page-previous-button",
      },
      {
        name: "fires props.onNextClick when Next button is clicked",
        funcName: "onNextClick",
        testId: "step-page-next-button",
      },
    ],
  );
});
