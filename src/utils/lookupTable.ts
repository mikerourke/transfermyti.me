/**
 * Provide a way to lookup values using an object and search key, as well as
 * provide a default.
 * @example
 *  const result = lookupTable(
 *    "baz",
 *    {
 *        foo: "a",
 *        bar: "b",
 *        default: "c",
 *    }
 *  )
 *  console.log(result); // "c"
 */
export function lookupTable<T>(
  searchKey: string,
  values: Record<string, T> & { default: T },
): T {
  const tableProxy = new Proxy(values, {
    get(object: object & { default: T }, property: string) {
      return object.hasOwnProperty(property)
        ? object[property]
        : object.default;
    },
  });

  return tableProxy[searchKey];
}
