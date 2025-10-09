const CHECK_INTERVAL = 100 // ms
const MAX_CHECKS = 50

export async function whenPresent(selector: string): Promise<HTMLElement> {
  return new Promise((resolve, reject) => {
    let checks = 0

    const interval = setInterval(() => {
      checks++
      const target = document.querySelector(selector) as HTMLElement
      if (target) {
        resolve(target)
        clearInterval(interval)
      } else if (checks > MAX_CHECKS) {
        clearInterval(interval)
        reject(new Error(`Element ${selector} not found after ${MAX_CHECKS * CHECK_INTERVAL}ms`))
      }
    }, CHECK_INTERVAL)
  })
}
