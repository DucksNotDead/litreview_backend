import { TQueryWithParams } from '../types';
import { useNormalizedParams } from './useNormalizedParams';

type FiltersConfig<T extends object> = {
  [P in keyof T]: [string, unknown[]];
};

export function useFilters<T extends object>(
  filters: T | undefined,
  config: FiltersConfig<T>,
): TQueryWithParams {
  if (!filters) {
    return ['', []];
  }

  return Object.keys(filters).reduce(
    (state, key) => {
      const [prevRules, prevParams] = state;
      const [originalRule, originalParams] = config[key as keyof typeof config];
      const normalizedParams = useNormalizedParams(
        originalRule,
        originalParams,
      );
      const lastRuleIndex = Math.max(
        ...[prevRules.match(/\$(\d+)/g) || ['$0']].map((m) =>
          Number(m.slice(1)),
        ),
      );
      const normalizedRule = originalRule.replace(
        /\$(\d+)/g,
        (_, index) => `$${Number(index) + lastRuleIndex}`,
      );
      return [
        `${prevRules} AND (${normalizedRule})`,
        [...prevParams, ...normalizedParams],
      ];
    },
    [' WHERE (1 = 1)', []],
  );
}
