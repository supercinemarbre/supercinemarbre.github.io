import { computed } from "vue";
import reactiveWindow from "./window";

export const isMobileMode = computed(() => {
  return reactiveWindow.value.width < 991;
});
