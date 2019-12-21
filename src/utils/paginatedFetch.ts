import { flatten } from "lodash";
import { API_PAGE_SIZE } from "~/constants";
import { pause } from "~/utils";

export async function paginatedFetch<TEntity>({
  apiFetchFunc,
  funcArgs,
  requestsPerSecond = 4,
}: {
  apiFetchFunc: (...args: unknown[]) => Promise<TEntity[]>;
  funcArgs: unknown[];
  requestsPerSecond?: number;
}): Promise<TEntity[]> {
  let keepFetching = true;
  let currentPage = 1;

  const allEntities: TEntity[] = [];

  while (keepFetching) {
    const entities = await apiFetchFunc(...funcArgs, currentPage);
    keepFetching = entities.length === API_PAGE_SIZE;
    allEntities.push(...entities);
    await pause(1_000 / requestsPerSecond);

    currentPage += 1;
  }

  return flatten(allEntities);
}
