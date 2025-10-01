import { computed } from "vue";
import reactiveWindow from "./reactive-window";

export const isMobileMode = computed(() => {
  return reactiveWindow.value.width < 991;
});
