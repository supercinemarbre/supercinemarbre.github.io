export function formatOrdinal(n: number): string {
  if (n === 1) {
    return n.toString() + 'er';
  } else {
    return n.toString() + 'e';
  }
}
