import * as R from "ramda";
import { EntityGroup, Mapping } from "~/allEntities/allEntitiesTypes";

export function linkEntitiesByIdByMapping<TEntity>(
  sourceRecords: TEntity[],
  targetRecords: TEntity[],
): Record<Mapping, Record<string, TEntity>> {
  if (sourceRecords.length === 0) {
    return {
      source: {},
      target: {},
    };
  }

  return {
    source: linkForMappingByName(targetRecords, sourceRecords),
    target: linkForMappingByName(sourceRecords, targetRecords),
  };
}

function linkForMappingByName<TEntity>(
  linkFromRecords: TEntity[],
  recordsToUpdate: TEntity[],
): Record<string, TEntity> {
  type LinkableRecord = TEntity & {
    name: string;
    id: string;
    memberOf: EntityGroup;
  };

  const linkFromEntitiesByName = {};
  for (const linkFromRecord of linkFromRecords as LinkableRecord[]) {
    linkFromEntitiesByName[linkFromRecord.name] = linkFromRecord;
  }

  const linkedRecordsById = {};
  for (const recordToUpdate of recordsToUpdate as LinkableRecord[]) {
    const linkedId = R.pathOr(
      null,
      [recordToUpdate.name, "id"],
      linkFromEntitiesByName,
    );

    linkedRecordsById[recordToUpdate.id] = {
      ...recordToUpdate,
      linkedId,
      isIncluded: R.or(
        recordToUpdate.memberOf === EntityGroup.Workspaces,
        R.isNil(linkedId),
      ),
    };
  }

  return linkedRecordsById;
}
