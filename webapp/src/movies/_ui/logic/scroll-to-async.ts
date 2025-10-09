export function scrollToAsync(selector: string) {
  const scrollInterval = setInterval(() => {
    const target = document.querySelector(selector) as HTMLElement
    if (target) {
      target.scrollIntoView({ block: 'center' })
      clearInterval(scrollInterval)
    }
  }, 100)
}
