<template>
  <div>
    <div class="search-pattern">
      <stave></stave>

      <switch-input></switch-input>

      <keyboard v-if="switchInput.piano_selected.value"></keyboard>
      <micro-recorder v-else></micro-recorder>

      <search-param @receiveData="getData" @showPaginatedResult="showPaginatedResults()"></search-param>
    </div>
    <paginated-results :loading="resultsIsLoading" :data="searchResults" v-if="paginatedIsShown" />
  </div>
</template>

<script setup>
import Stave from '@/components/common/Stave.vue';
import SwitchInput from '@/components/common/SwitchInput.vue';
import Keyboard from '@/components/common/Keyboard.vue';
import MicroRecorder from '@/components/common/MicroRecorder.vue';
import SearchParam from '@/components/common/SearchParam.vue';
import PaginatedResults from '@/components/common/PaginatedResults.vue';

import SwitchInputClass from '@/lib/switch_input.js';

import { ref } from 'vue';

defineOptions({
  name: 'SearchInterfaceView',
});

const switchInput = SwitchInputClass.getInstance();

const paginatedIsShown = ref(false);
const searchResults = ref([]);
const resultsIsLoading = ref(false);

function showPaginatedResults() {
  // This function is called when the SearchParam start a search
  paginatedIsShown.value = true;
  resultsIsLoading.value = true; // Set loading state to true while results are being fetched
}

function getData(data) {
  // This function receives the data from SearchParam component
  // and updates the searchResults to displayed them in PaginatedResults component
  // It also sets the loading state to false after data is received
  searchResults.value = data;
  resultsIsLoading.value = false; // Set loading state to false after data is received
}
</script>

<style scoped>
.search-pattern {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  gap: 10px;
  position: relative;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin: 0 auto 20px auto; /* centre horizontalement */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: fit-content;   /* 🔑 largeur adaptée au contenu */
  max-width: 100%;      /* sécurité : jamais plus large que l’écran */
}
</style>
