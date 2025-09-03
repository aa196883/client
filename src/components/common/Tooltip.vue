<template>
    <div
      v-if="visible"
      class="info-tooltip"
      :style="{ top: `${position.y}px`, left: `${position.x}px` }"
    >
      {{ text }}
    </div>
  </template>
  
  <script setup>
  import { ref } from "vue";
  
  const visible = ref(false);
  const text = ref("");
  const position = ref({ x: 0, y: 0 });
  
  /**
   * pour montrer / cacher le tooltip
   */
  function show(e, newText) {
    text.value = newText;
    visible.value = true;
    position.value = { x: e.clientX + 15, y: e.clientY + 15 };
  }
  
  function hide() {
    visible.value = false;
  }
  
  defineExpose({ show, hide });
  </script>
  
  <style scoped>
  .info-tooltip {
    position: fixed; /* important pour sortir du flux parent */
    z-index: 1000;
    background: #f0f0f0;
    border: 1px solid #ccc;
    padding: 8px;
    font-size: 12px;
    border-radius: 4px;
    max-width: 300px;
    pointer-events: none; /* ne bloque pas la souris */
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  }
  </style>
  