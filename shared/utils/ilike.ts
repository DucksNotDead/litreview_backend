export function ilike(value: string | undefined) {
  return `%${value ?? ''}%`;
}
