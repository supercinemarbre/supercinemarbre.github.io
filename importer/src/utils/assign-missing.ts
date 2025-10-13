export function assignMissing<T>(target: T, source: Partial<T>): T {
  return Object.assign(target, source, { ...target });
}
