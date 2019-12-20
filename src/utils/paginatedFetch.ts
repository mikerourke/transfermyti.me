import { flatten } from "lodash";
import { API_PAGE_SIZE } from "~/constants";
import { pause } from "~/utils";

export async function paginatedFetch<TEntity>({
  apiFetchFunc,
  funcArgs,
  requestsPerSecond = 4,
}: {
  apiFetchFunc: (...args: Array<unknown>) => Promise<Array<TEntity>>;
  funcArgs: Array<unknown>;
  requestsPerSecond?: number;
}): Promise<Array<TEntity>> {
  let keepFetching = true;
  let currentPage = 1;

  const allEntities: Array<TEntity> = [];

  while (keepFetching) {
    const entities = await apiFetchFunc(...funcArgs, currentPage);
    keepFetching = entities.length === API_PAGE_SIZE;
    allEntities.push(...entities);
    await pause(1000 / requestsPerSecond);

    currentPage += 1;
  }

  return flatten(allEntities);
}
