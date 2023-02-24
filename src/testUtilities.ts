export { FAKES } from "~/redux/__fakes__/state";

type MockInstance = jest.MockInstance<AnyValid, AnyValid>;

interface WrapForMockingReturn {
  calls: AnyValid[];
  clear(): MockInstance;
  implementOnce(funcOrReturn: AnyValid): MockInstance;
  rejectAlways(err?: AnyValid): MockInstance;
  rejectOnce(err?: AnyValid): MockInstance;
  resolveMultiple(values: AnyValid[]): void;
  resolveOnce(value?: AnyValid): MockInstance;
  returnOnce(value?: AnyValid): MockInstance;
  returnMultiple(values: AnyValid[]): void;
  throwOnce(message?: string): MockInstance;
}

/**
 * Wrappers around someFunc.mock...() that Jest provides. Using
 * this avoids the annoying `someFunc as AnyValid` required to shut TypeScript
 * up.
 */
export function wrapForMocking(func: AnyValid): WrapForMockingReturn {
  return {
    calls: func?.mock?.calls,
    clear(): MockInstance {
      return func.mockClear();
    },
    implementOnce(funcOrReturn: AnyValid): MockInstance {
      if (typeof funcOrReturn === "function") {
        return func.mockImplementationOnce(funcOrReturn);
      } else {
        return func.mockImplementationOnce(() => funcOrReturn);
      }
    },
    rejectAlways(err: AnyValid = "error"): MockInstance {
      return func.mockRejectedValue(
        typeof err === "string" ? new Error(err) : err,
      );
    },
    rejectOnce(err: AnyValid = "error"): MockInstance {
      return func.mockRejectedValueOnce(
        typeof err === "string" ? new Error(err) : err,
      );
    },
    resolveMultiple(values: AnyValid[]): void {
      for (const value of values) {
        func.mockResolvedValueOnce(value);
      }
    },
    resolveOnce(value: AnyValid = null): MockInstance {
      return func.mockResolvedValueOnce(value);
    },
    returnOnce(value: AnyValid = null): MockInstance {
      return func.mockReturnValueOnce(value);
    },
    returnMultiple(values: AnyValid[]): void {
      for (const value of values) {
        func.mockReturnValueOnce(value);
      }
    },
    throwOnce(message: string = "error"): MockInstance {
      return func.mockImplementationOnce(() => {
        throw new Error(message);
      });
    },
  };
}

/**
 * Allows you to get around `delay()` calls in sagas.
 * @see https://github.com/jfairbank/redux-saga-test-plan/issues/257#issuecomment-503016758
 * @example
 *   return expectSaga(someSaga)
 *     .provide([
 *       { call: provideDelay },
 *     ])
 *     ...
 */
export function provideDelay(
  { fn }: AnyValid,
  next: AnyValid,
): null | VoidFunction {
  return fn.name === "delayP" ? null : next();
}
