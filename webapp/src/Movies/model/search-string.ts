function removeAccents(text: string) {
  return (text?.toString() || '')
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

export function toSearchString(text: string) {
  return removeAccents(text).toLowerCase().replace(/[^a-zA-Z0-9]/g, '')
}
