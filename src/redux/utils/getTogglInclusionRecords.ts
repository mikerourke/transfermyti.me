import get from 'lodash/get';
import isNil from 'lodash/isNil';

export default function getTogglInclusionRecords<TModel>(
  entityRecords: TModel[],
): TModel[] {
  return entityRecords.reduce(
    (acc, entityRecord: TModel & { isIncluded: boolean }) => {
      // If there is no corresponding entity with the same name on Clockify
      // and the user marked it as included, we're good to go!
      if (!isNil(get(entityRecord, 'linkedId', null))) return acc;
      if (!entityRecord.isIncluded) return acc;

      return [...acc, entityRecord];
    },
    [],
  );
}
