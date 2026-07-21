export function isMember<TPrimitive extends string | number>(
  value: string | number,
  allowedValues: readonly TPrimitive[],
): value is TPrimitive {
  return (allowedValues as readonly (string | number)[]).includes(value);
}
