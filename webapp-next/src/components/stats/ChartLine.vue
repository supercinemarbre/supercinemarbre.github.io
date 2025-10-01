<script setup lang="ts">
import { LineChart } from 'chartist';
import { generateId } from 'src/services/utils';
import { ref, watch, onMounted } from 'vue';

const props = defineProps<{
  labels: (string | number | undefined)[];
  series: number[][];
  height?: number | string;
}>();

const id = generateId();
const chart = ref<LineChart | null>(null);

function refresh() {
  if (chart.value) {
    chart.value.detach();
  }
  chart.value = new LineChart(`#${id}`, {
    series: props.series,
    labels: props.labels
  }, {
    height: props.height || 200
  });
}

onMounted(() => {
  refresh();
});

watch(() => [props.labels, props.series], () => {
  refresh();
});
</script>

<template>
  <div :id="id" class="chart"></div>
</template>

<style lang="scss">
@import '/node_modules/chartist/dist/index.css';

.chart {
  line {
    stroke: white;
  }
  .ct-series * {
    stroke: #f4c63d;
  }
  .ct-label {
    color: white;
  }
}
</style>
