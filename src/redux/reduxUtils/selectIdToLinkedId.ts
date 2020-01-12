import * as R from "ramda";
import { ValidEntity } from "~/typeDefs";

/**
 * Returns an object with a key of the source record's `id` field and a value
 * of the `linkedId` field and vice versa. The method name is prefixed with
 * `select` because it's used in selectors.
 * @example
 *  const sourceTagsById = {
 *    srctag1: { id: "srctag1", name: "Tag 1", linkedId: "tartag1" },
 *    srctag2: { id: "srctag2", name: "Tag 2", linkedId: "tartag2" },
 *  }
 *
 *  console.log(selectIdToLinkedId(sourceTagsById));
 *  // Logs out:
 *  {
 *    srctag1: tartag1,
 *    tartag1: srctag1,
 *    srctag2: tartag2,
 *    tartag2: srctag2,
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
