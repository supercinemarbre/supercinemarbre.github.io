import { debounce } from 'lodash-es'
import { watch, type WatchHandle, type WatchSource } from 'vue'

export function watchDebounced<T>(source: WatchSource<T>, callback: (value: T) => void, delay: number): WatchHandle {
  const debounced = debounce((debounceCallback) => debounceCallback(), delay)
  return watch(source, (value) => {
    debounced(() => callback(value))
  })
}
