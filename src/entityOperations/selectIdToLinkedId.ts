import * as R from "ramda";

import type { ValidEntity } from "~/typeDefs";

/**
 * Returns an object with a key of the source record's `id` field and a value
 * of the `linkedId` field and vice versa. The method name is prefixed with
 * `select` because it's used in selectors.
 * @example
 *  const sourceTagsById = {
 *    srcTag1: { id: "srcTag1", name: "Tag 1", linkedId: "tarTag1" },
 *    srcTag2: { id: "srcTag2", name: "Tag 2", linkedId: "tarTag2" },
 *  }
 *
 *  console.log(selectIdToLinkedId(sourceTagsById));
 *  // Logs out:
 *  {
 *    srcTag1: tarTag1,
 *    tarTag1: srcTag1,
 *    srcTag2: tarTag2,
 *    tarTag2: srcTag2,
 *  }
 */
export function selectIdToLinkedId<TEntity>(
  sourceRecordsById: Record<string, TEntity>,
): Record<string, string> {
  const sourceRecordEntries = Object.entries(sourceRecordsById) as [
    string,
    ValidEntity<TEntity>,
  ][];

  const idToLinkedId: Record<string, string> = {};

  for (const [id, sourceRecord] of sourceRecordEntries) {
    if (!R.isNil(sourceRecord.linkedId)) {
      idToLinkedId[id] = sourceRecord.linkedId;
      idToLinkedId[sourceRecord.linkedId] = sourceRecord.id;
    }
  }

  return idToLinkedId;
}
