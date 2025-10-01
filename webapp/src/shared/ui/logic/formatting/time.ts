export function formatTime(isoString: string): string {
  if (isoString) {
    const date = new Date(isoString);
    return date.toLocaleTimeString();
  } else {
    return '???';
  }
}
