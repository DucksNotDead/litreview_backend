export function useNormalizedParams(
  originalSQL: string,
  originalParams?: unknown[],
): unknown[] {
  const paramsIndexes = originalSQL.split('$').map((str) => Number(str[0]) - 1);
  paramsIndexes.shift();

  return paramsIndexes.map((index) => originalParams?.[index]);
}
