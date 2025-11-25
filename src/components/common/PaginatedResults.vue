<template>
  <div class="paginated-results">
    <div class="navigation">
      <button id="csv-button" class="pagination-bt">Télécharger les résultats en CSV</button>

      <label id="score_nb_lb">Nombre de partitions : {{ nbScores }} </label>
      <button id="prevPage" class="pagination-bt" :disabled="pageNb === 1" @click="prevDataPageHandler()">Page précédente</button>
      <input type="number" min="1" :max="nbPages" value="1" id="page_nb_input" class="page-nb-input" v-model="pageNb" />
      <label id="page_max_nb_lb"> / {{ nbPages }}</label>
      <button id="nextPage" class="pagination-bt" :disabled="pageNb === nbPages" @click="nextDataPageHandler()">
        Page suivante
      </button>
      <select id="nb_per_page_select" @click="nbPerPageHandler($event.target.value)">
        <option value="10">10</option>
        <option value="20">20</option>
        <option value="50">50</option>
        <option value="100">100</option>
        <option value="*">Tout</option>
      </select>
      <label id="nb_per_page_lb"> par page</label>
    </div>

    <div class="results-container" id="results-container">
      <h3 v-if="props.loading" class="text-center">Chargement</h3>
      <h3 v-else-if="props.data.length == 0" class="text-center">Aucun résultat</h3>
      <div v-else v-for="(score, index) in paginatedScores" :key="index" class="score-preview" @click="openScoreDetail(score)">
        <div class="music-score-box" :id="score.source" v-html="score.svg"></div>
        <p v-if="score.number_of_occurrences" class="score_author">Occurences : {{ score.number_of_occurrences }}</p>
        <p v-if="score.max_match_degree" class="score_author">Satisfaction : {{ Math.floor(score.max_match_degree * 100) }}%</p>
        <h4 v-if="score.title" class="score_title">{{ score.title }}</h4>
      </div>
    </div>

    <div class="navigation" v-if="nbPages > 1">
      <button id="prevPage-bot" class="pagination-bt" :disabled="pageNb == 1" @click="prevDataPageHandler()">
        Page précédente
      </button>
      <label id="page_max_nb_lb-bot"> {{ pageNb }} / {{ nbPages }}</label>
      <button id="nextPage-bot" class="pagination-bt" :disabled="pageNb == nbPages" @click="nextDataPageHandler()">
        Page suivante
      </button>
    </div>

    <!-- Modal de détail de la partition -->
    <ScoreDetailModal
      :is-open="isModalOpen"
      :score-data="selectedScore"
      :author-name="authors.selectedAuthorName"
      @close="closeModal"
    />
  </div>
</template>

<script setup>
import { useAuthorsStore } from '@/stores/authorsStore';
import { useVerovioStore } from '@/stores/verovioStore';
import { getPageN, extractTitleAuthorComment, removePgHead, colorMatches } from '@/services/dataManagerServices';
import { fetchMeiFileByFileName } from '@/services/dataBaseQueryServices';
import { computed, ref, watch } from 'vue';
import ScoreDetailModal from '@/components/modals/ScoreDetailModal.vue';

defineOptions({
  name: 'PaginatedResults',
});

const props = defineProps({
  data: {
    type: Array,
    default: () => [],
    required: true,
  },
  loading: {
    type: Boolean,
    default: true,
    required: true,
  },
});

const verovio = useVerovioStore();
const authors = useAuthorsStore();
const paginatedScores = ref([]);
const isModalOpen = ref(false);
const selectedScore = ref({});
const nbScores = computed(() => {
  return props.data.length;
});
const pageNb = ref(0);
const nbPerPage = ref(10);
const nbPages = computed(() => {
  if (!props.data || props.data.length === 0) return 0; // If no data, no pages
  if (nbPerPage.value === nbScores.value) return 1; // If all items are shown, only one page is needed
  return Math.ceil(nbScores.value / nbPerPage.value); // Calculate the number of pages needed
});
const sortedData = ref([]);

function nbPerPageHandler(value) {
  if (value === '*') {
    nbPerPage.value = nbScores.value;
  } else {
    nbPerPage.value = value;
  }
  LoadPageN();
}

function nextDataPageHandler() {
  pageNb.value++;
}

function prevDataPageHandler() {
  pageNb.value--;
}

watch(pageNb, () => {
  // always keep pageNb in range (1 <= pageNb <= nbPages)
  if (pageNb.value === '') return; // ne rien faire si pageNb est vide
  if (pageNb.value < 1) {
    pageNb.value = 1;
  } else if (pageNb.value > nbPages.value) {
    pageNb.value = nbPages;
  }
  if (nbPages.value > 0) {
    // only load page if there are pages
    LoadPageN();
  }
});

watch(
  () => props.data,
  (newData) => {
    sortedData.value = sortByMatchDegree(newData);
    if (pageNb.value === 1) {
      LoadPageN();
    } else {
      pageNb.value = 1;
    }
  },
);

function LoadPageN() {
  // remove the previous scores
  paginatedScores.value = [];

  // slice the data from the page requested
  const dataSlice = getPageN(sortedData.value, pageNb.value, nbPerPage.value);

  // check if the data is a collection data or a search result
  const isCollectionData = typeof dataSlice[0] === 'string';
  dataSlice.forEach((data) => {
    let item;
    let fileName;

    if (isCollectionData) {
      fileName = data;
      item = { source: fileName };
    } else {
      fileName = data.source;
      item = data;
    }

    fetchMeiFileByFileName(fileName, authors.selectedAuthorName).then((meiXML) => {
      // extract title
      const { title, author, comment } = extractTitleAuthorComment(meiXML, fileName);
      item['title'] = title;
      item['author'] = author;
      item['comment'] = comment;
      paginatedScores.value.push(item);
      // remove title, author and comment that are overlapping each other and are not useful in the preview
      meiXML = removePgHead(meiXML);
      item['meiXML'] = meiXML; // store the meiXML in the item for later use in the modal
      verovio.ensureTkInitialized().then(() => {
        // parameters for rendering
        // same as in ejs version
        // parameter never used in the ejs version only the preset value
        const parentWidth = 180;
        const parentHeight = 250;
        const zoom = 20;
        const pageHeight = (parentHeight * 100) / zoom;
        const pageWidth = (parentWidth * 100) / zoom;
        const options = {
          pageHeight: pageHeight,
          pageWidth: pageWidth,
          scale: zoom,
        };
        verovio.tk.setOptions(options);
        const index = paginatedScores.value.findIndex((score) => score.source === fileName);
        if (index !== -1) {
          verovio.tk.loadData(meiXML);
          paginatedScores.value[index]['svg'] = verovio.tk.renderToSVG(1);
          if (!isCollectionData) {
            // color the matches
            colorMatches(paginatedScores.value[index]);
          }
        }
      });
    });
  });
}

// Gestion de la modal
const openScoreDetail = (score) => {
  selectedScore.value = score;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedScore.value = {};
};

function sortByMatchDegree(scores) {
  return scores.slice().sort((a, b) => {
    const degA = a.max_match_degree ?? 0;
    const degB = b.max_match_degree ?? 0;
    return degB - degA;
  });
}

</script>

<style scoped>
.paginated-results {
  flex: 1;
  padding: 20px;
  width: auto;
  overflow: auto;
  background-color: white;
}

.navigation {
  text-align: right;
}

/* .paginated-result { */
/*     flex: 0 0 20%; */
/*     overflow: hidden; */
/* } */

/* .collections {
    flex: 0 0 20%;
    background-color: #62aadd;
    padding: 0px;
    font-size: 20px;
} */

.pagination-bt {
  border-radius: 5px;
  min-height: 30px;
  min-width: 100px;
  border: none;
  cursor: pointer;
  margin: 0 10px;
  background-color: #bfdaed;
  color: black;
  font-size: 12px;
  padding: 0 10px;
}

.pagination-bt:hover {
  background-color: #62aadd;
}

.pagination-bt:disabled {
  background-color: #ccc;
  color: #666;
  cursor: not-allowed;
}

#csv-button {
  float: inline-start;
}

.page-nb-input {
  width: 40px;
}

.results-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.score-preview {
  text-decoration: none;
  color: #000;
  padding: 15px;
}

.score_title {
  margin-left: 8px;
  margin-top: 10px;
  width: 180px;
}

.music-score-box {
  width: 180px;
  height: 250px;
  background-color: #e6f2f8;
  border-radius: 10px;
  border: 2px solid #20aabd;
  padding: 10px;
  margin: 5px;
  word-wrap: break-word;
  overflow-x: hidden;
  overflow-y: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}
.music-score-box:hover {
  cursor: pointer;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.3);
  background-color: #dceaf1;
}
.music-score-box svg {
  max-width: 100%;
  max-height: 100%;
}

a:hover {
  color: #1e70bf;
  text-decoration: none;
}
</style>
