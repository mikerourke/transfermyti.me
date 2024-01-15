import { createAction, type PayloadActionCreator } from "@reduxjs/toolkit";

export {
  createAction,
  createReducer,
  createSelector,
  nanoid,
  type AnyAction,
  type Selector,
} from "@reduxjs/toolkit";

export type TypeConstant = string;

interface AsyncActionCreator<
  TRequestPayload,
  TSuccessPayload,
  TFailurePayload,
  TType extends TypeConstant = TypeConstant,
> {
  request: PayloadActionCreator<TRequestPayload, `${TType}Request`>;
  success: PayloadActionCreator<TSuccessPayload, `${TType}Success`>;
  failure: PayloadActionCreator<TFailurePayload, `${TType}Failure`>;
}

export function createAsyncAction<
  TRequestPayload,
  TSuccessPayload,
  TFailurePayload,
  TType extends TypeConstant = TypeConstant,
>(
  type: TType,
): AsyncActionCreator<
  TRequestPayload,
  TSuccessPayload,
  TFailurePayload,
  TType
> {
  return {
    request: createAction<TRequestPayload, `${TType}Request`>(`${type}Request`),
    success: createAction<TSuccessPayload, `${TType}Success`>(`${type}Success`),
    failure: createAction<TFailurePayload, `${TType}Failure`>(`${type}Failure`),
  };
}

interface ActionCreatorTypeMetadata<TType extends TypeConstant> {
  getType?: () => TType;
}

type ActionCreator<T extends { type: TypeConstant }> = ((
  ...args: AnyValid[]
) => T) &
  ActionCreatorTypeMetadata<T["type"]>;

export type ActionType<TActionCreatorOrMap> =
  TActionCreatorOrMap extends ActionCreator<{ type: TypeConstant }>
    ? ReturnType<TActionCreatorOrMap>
    : TActionCreatorOrMap extends Record<AnyValid, AnyValid>
      ? {
          [K in keyof TActionCreatorOrMap]: ActionType<TActionCreatorOrMap[K]>;
        }[keyof TActionCreatorOrMap]
      : // eslint-disable-next-line @typescript-eslint/no-unused-vars
        TActionCreatorOrMap extends infer R
        ? never
        : never;

export function isActionOf<
  TActionCreator extends ActionCreator<{ type: TypeConstant }>,
>(
  actionCreatorOrCreators: TActionCreator | TActionCreator[],
  action: { type: TypeConstant },
): action is ReturnType<TActionCreator> {
  const actionCreators = Array.isArray(actionCreatorOrCreators)
    ? actionCreatorOrCreators
    : [actionCreatorOrCreators];

  return actionCreators.some(
    (actionCreator) => action.type === actionCreator.toString(),
  );
}
