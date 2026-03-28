export function countCharacters(value: string): number {
  return Array.from(value).length;
}

export function isWithinCharacterLimit(
  value: string,
  maxCharacters: number
): boolean {
  return countCharacters(value) <= maxCharacters;
}
