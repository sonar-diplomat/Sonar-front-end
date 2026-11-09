export function mergeSearchItems<T extends { id: number }>(previous: T[], page: T[]): T[] {
  return [...new Map([...previous, ...page].map(item => [item.id, item])).values()];
}
