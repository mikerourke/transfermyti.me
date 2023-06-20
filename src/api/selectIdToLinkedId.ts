import { isNil } from "ramda";

import type { ValidEntity } from "~/types";

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
  sourceRecordsById: Dictionary<TEntity>,
): Dictionary<string> {
  type ValidEntityTupleArray = [string, ValidEntity<TEntity>][];

  // prettier-ignore
  const sourceRecordEntries = Object.entries(sourceRecordsById) as ValidEntityTupleArray;

  const idToLinkedId: Dictionary<string> = {};

  for (const [id, sourceRecord] of sourceRecordEntries) {
    if (!isNil(sourceRecord.linkedId)) {
      idToLinkedId[id] = sourceRecord.linkedId;

      idToLinkedId[sourceRecord.linkedId] = sourceRecord.id;
    }
  }

  return idToLinkedId;
}
