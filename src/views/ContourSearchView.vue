<template>
  <div>
    <div class="search-contour">
      <h2>Recherche par contour</h2>

      <div class="field">
        <label for="melodic-contour">Contour mélodique</label>
        <textarea
          id="melodic-contour"
          v-model="melodicContour"
          placeholder="Ex. UUDD"
          rows="3"
        />
      </div>

      <div class="field">
        <label for="rhythmic-contour">Contour rythmique</label>
        <textarea
          id="rhythmic-contour"
          v-model="rhythmicContour"
          placeholder="Ex. LLSS"
          rows="3"
        />
      </div>

      <div class="field">
        <label for="collections">Collection (demo EDBT)</label>
        <select id="collections" name="collections" v-model="selectedAuthorName">
          <option
            v-for="(author, index) in authors.listeAuthors"
            :key="index"
            :value="author"
          >
            {{ author }}
          </option>
        </select>
      </div>

      <button class="btn text-white send-button" type="button" @click="runContourSearch">Recherche</button>
    </div>

    <paginated-results :loading="resultsIsLoading" :data="searchResults" v-if="paginatedIsShown" />
  </div>
</template>

<script setup lang="ts">
import PaginatedResults from '@/components/common/PaginatedResults.vue';
import { fetchSearchResults } from '@/services/dataBaseQueryServices.ts';
import { useAuthorsStore } from '@/stores/authorsStore.ts';

import { computed, onMounted, ref } from 'vue';

defineOptions({
  name: 'ContourSearchView',
});

const authors = useAuthorsStore();
const melodicContour = ref('');
const rhythmicContour = ref('');
const paginatedIsShown = ref(false);
const searchResults = ref([]);
const resultsIsLoading = ref(false);

const selectedAuthorName = computed({
  get: () => authors.selectedAuthorName,
  set: (value: string) => {
    const authorIndex = authors.listeAuthors.indexOf(value);
    authors.setSelectedAuthorIndex(authorIndex >= 0 ? authorIndex : 0);
  },
});

onMounted(() => {
  authors.loadAuthors();
});

async function runContourSearch() {
  if (!melodicContour.value.trim() && !rhythmicContour.value.trim()) {
    alert('Veuillez renseigner au moins un contour (mélodique ou rythmique).');
    return;
  }

  paginatedIsShown.value = true;
  resultsIsLoading.value = true;

  try {
    searchResults.value = await fetchSearchResults({
      // NOTES must be a string containing a rhythmic sequence ('L', 'M', 'l', 'S', 's', 'X') and a melodic contour sequence ('*U', 'U', 'u', 'R', 'd', 'D', '*D', 'X'), separated by '-'. Example: 'URdU*-LMl'."
      notes: `${melodicContour.value.trim()}-${rhythmicContour.value.trim()}`,
      contour_match: true,
      collection: authors.selectedAuthorName,
      incipit_only: false,
      allow_transposition: false,
      allow_homothety: false,
      pitch_distance: 0,
      duration_factor: 1,
      duration_gap: 0,
      alpha: 0,
      mode: '',
    });
  } catch (error) {
    console.error('Error running contour search:', error);
    searchResults.value = [];
  } finally {
    resultsIsLoading.value = false;
  }
}
</script>

<style scoped>
.search-contour {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 24px auto;
  padding: 20px;
  width: min(800px, 100%);
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

textarea,
select {
  border: 1px solid #ced4da;
  border-radius: 6px;
  padding: 8px;
}

.send-button {
  width: fit-content;
  background-color: #7ab6e0;
}
</style>
