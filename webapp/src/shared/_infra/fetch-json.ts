import axios from 'axios'

const cache: Record<string, unknown> = {}

export async function fetchJSON<T>(filename: string): Promise<T> {
  if (!cache[filename]) {
    const response = await axios.get(`${filename}?${import.meta.env.VITE_APP_BUILD_TIME}`, {
      responseType: 'json'
    })
    cache[filename] = response.data
  }
  return cache[filename] as T
}
