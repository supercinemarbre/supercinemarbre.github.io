import { debounce } from 'lodash-es'
import { watch, type WatchSource } from 'vue'

export function watchDebounced<T>(source: WatchSource<T>, callback: (value: T) => void, delay: number) {
  const debounced = debounce((debounceCallback) => debounceCallback(), delay)
  watch(source, (value) => {
    debounced(() => callback(value))
  })
}
