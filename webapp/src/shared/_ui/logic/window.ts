import { computed, reactive, readonly } from 'vue'

const window = globalThis.window

const reactiveWindow = reactive({
  width: window.innerWidth,
  height: window.innerHeight
})

window.addEventListener('resize', () => {
  reactiveWindow.width = window.innerWidth
  reactiveWindow.height = window.innerHeight
})

export default computed(() => readonly(reactiveWindow))
