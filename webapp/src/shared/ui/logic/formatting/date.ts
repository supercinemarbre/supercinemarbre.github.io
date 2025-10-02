
export function formatDate(isoString: string): string {
  if (isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString();
  } else {
    return '???';
  }
}
