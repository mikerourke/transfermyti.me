export function capitalize(value: string): string {
  return value
    .charAt(0)
    .toUpperCase()
    .concat(value.slice(1));
}
