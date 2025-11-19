<template>
  <div v-if="isOpen" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h1>{{ scoreData.title || 'Partition' }}</h1>
        <button class="close-button" @click="closeModal">×</button>
      </div>

      <div class="modal-body">
        <!-- Contrôles de lecture -->
        <div class="playback-controls">
          <button @click="togglePlayback" class="play-button">
            {{ playStatus }}
          </button>
          <button @click="stopPlayback" class="stop-button">Stop</button>
          <div class="tempo-control">
            <label>Tempo: {{ tempo }} BPM</label>
            <input type="range" step="10" min="60" max="200" v-model="tempo" @input="updateTempo" />
          </div>
        </div>

        <div class="score-details">
          <!-- Affichage de la partition -->
          <div class="score-display">
            <div v-html="scoreSvg" class="svg-container" ref="svgContainer"></div>
            <div class="score-footer">
              <h6 v-if="scoreData.author" class="score-author">{{ scoreData.author }}</h6>
              <p v-if="scoreData.comment" class="score-comment">
                <span class="comment">Commentaire:</span> <br />{{ scoreData.comment }}
              </p>
            </div>
          </div>
          <div v-if="matches.length > 0" class="results-details">
            <!-- Échelle de couleur -->
            <div class="color-scale">
              <h3>Échelle de satisfaction</h3>
              <div class="color-gradient">
                <div class="gradient-bar"></div>
                <div class="gradient-labels">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            <!-- Contrôles de sélection des résultats -->
            <div class="match-controls">
              <h3>Résultats de recherche</h3>
              <button @click="selectAllMatches" class="control-button">Tout sélectionner</button>
              <button @click="deselectAllMatches" class="control-button">Tout désélectionner</button>
              <div class="match-list">
                <div v-for="(match, index) in matches" :key="index" class="match-item">
                  <label>
                    <input
                      type="checkbox"
                      v-model="selectedMatchIndices"
                      :value="{ match, index }"
                      @change="refreshHighlighting"
                    />
                    Résultat {{ index + 1 }} ({{ Math.floor(match.overall_degree * 100) }}%)
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="note-tooltip" ref="tooltipDiv" v-if="isNoteInfoShown">
      <div class="note-info">
        <p>Résultat n° {{ hoveredNote.id }}</p>
        <p>Satisfaction globale de la note : {{ hoveredNote.note_deg }}%</p>
        <p>Satisfaction en hauteur : {{ hoveredNote.pitch_deg }}%</p>
        <p>Satisfaction en durée : {{ hoveredNote.duration_deg }}%</p>
        <p>Satisfaction de l’enchaînement : {{ hoveredNote.sequencing_deg }}%</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick, computed, type PropType } from 'vue';
import { useVerovioStore } from '@/stores/verovioStore';
import { useAudioPlayer } from '@/composables/useAudioPlayer';
import {
  getScoreMatches as extractScoreMatches,
  getMatchNotes,
  applyColorToNote,
  getNoteColor,
} from '@/services/resultProcessingService';
import type { Match, Note } from '@/types/api';
import type { DataResults } from '@/types/api';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  scoreData: {
    type: Object as PropType<DataResults>,
    required: true,
  },
  authorName: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['close']);

const verovio = useVerovioStore();
const scoreSvg = ref('');
const selectedMatchIndices = ref<{ match: Match; index: number }[]>([]);
const tempo = ref(120);
const svgContainer = ref<HTMLElement | null>(null);
const playStatus = computed(() => {
  if (isPlayingAudio.value) return 'Pause';
  if (isPausedAudio.value) return 'Reprendre';
  if (isStoppedAudio.value) return 'Jouer';
});
type HoveredNote = {
  id?: number;
  note_deg?: number;
  pitch_deg?: number;
  duration_deg?: number;
  sequencing_deg?: number;
};

const hoveredNote = ref<HoveredNote>({});
const isNoteInfoShown = ref(false);
const tooltipDiv = ref<HTMLElement | null>(null);

const matches = computed(() => extractScoreMatches(props.scoreData));

const getIndexedMatches = () => matches.value.map((match, index) => ({ match, index }));

// Composable pour la gestion audio
const {
  playScore,
  resumeScore,
  pauseScore,
  stopScore,
  updateTempo: updateAudioTempo,
  isPlayingAudio,
  isPausedAudio,
  isStoppedAudio,
  setHighlightCallbacks,
} = useAudioPlayer();

// Charger la partition complète
const renderScore = async () => {
  if (!props.scoreData.meiXML) return;
  // Rendre la partition avec Verovio
  await verovio.ensureTkInitialized();

  // Configuration pour affichage complet
  const options = {
    pageHeight: 60000, // show all the partition in one page with scroll
    pageWidth: 1600,
    scale: 40,
    adjustPageHeight: true, // permet à Verovio d'étendre la hauteur
  };

  verovio.tk.setOptions(options);
  verovio.tk.loadData(props.scoreData.meiXML);
  scoreSvg.value = verovio.tk.renderToSVG(1);

  await nextTick();
  // Appliquer le surlignage initial
  refreshHighlighting();

  await nextTick();

  // add hover effect on matches
  initNoteHoverInfo();
};

function initNoteHoverInfo() {
  const svgElement = svgContainer.value;
  if (!svgElement) return;

  matches.value.forEach((match, index) => {
    const matchNotes = getMatchNotes(match);
    if (matchNotes.length) {
      matchNotes.forEach((note) => {
        const noteElement = svgElement.querySelector(`#${note.id} .notehead`);
        if (noteElement) {
          noteElement.addEventListener('mouseover', (event) => {
            showNoteInfo(event as MouseEvent, match, index, note);
          });
          noteElement.addEventListener('mouseout', () => {
            // Clear hover info
            isNoteInfoShown.value = false;
            hoveredNote.value = {};
          });
        }
      });
    }
  });
}

/**
 * Handles when the note is hovered, and displays the div to the right place.
 *
 * If there are multiple matches over the same note, it only shows the one with the smaller `match_x` index (corresponding to the one with the better score, which will correspond to the color shown, as the better matches are shown in the first layer).
 *
 * @param {MouseEvent} event - the mouse event that triggered the hover;
 * @param {Object} match - the match object containing the overall degree and notes;
 * @param {number} index - the index of the match in the matches array;
 * @param {Object} note - the note object containing its id and satisfaction degrees;
 * @returns {Promise<void>} - a promise that resolves when the tooltip is displayed.
 */
async function showNoteInfo(event: MouseEvent, match_param: Match, index_param: number, note: Note) {
  const sortedSelectedMatches = selectedMatchIndices.value.sort((a, b) => a.index - b.index);

  const currentMatchIndex = sortedSelectedMatches.findIndex(({ match, index }) => index === index_param);
  // Show (only if match is visible and no other match with a smaller index is visible (to not overlap))
  if (currentMatchIndex === -1) return; // Do not show if match is not selected/visible

  for (let k = 0; k < currentMatchIndex; ++k) {
    const earlierMatchNotes = getMatchNotes(sortedSelectedMatches[k].match);
    if (earlierMatchNotes.findIndex((n) => n.id === note.id) !== -1) return;
  }

  // If still here, finally display the box
  hoveredNote.value = {
    id: index_param + 1, // +1 to match the index in the UI
    note_deg: Math.floor(note.note_deg * 100),
    pitch_deg: Math.floor(note.pitch_deg * 100),
    duration_deg: Math.floor(note.duration_deg * 100),
    sequencing_deg: Math.floor(note.sequencing_deg * 100),
  };
  isNoteInfoShown.value = true;
  await nextTick();
  const tooltipElement = tooltipDiv.value;
  if (!tooltipElement) return;
  tooltipElement.style.top = `${event.pageY + 10}px`;
  tooltipElement.style.left = `${event.pageX + 10}px`;
}

// Rafraîchir le surlignage selon les matches sélectionnés
const refreshHighlighting = async () => {
  await nextTick();

  // Effacer tous les surlignages existants
  clearAllHighlighting();

  if (!matches.value.length || selectedMatchIndices.value.length === 0) {
    return;
  }

  // La liste des matches est déjà triée, donc on peut juste la renverser
  const sortedSelectedMatches = selectedMatchIndices.value.sort((a, b) => b.index - a.index);

  // Appliquer le surlignage dans l'ordre (le meilleur score écrasera les autres)
  sortedSelectedMatches.forEach(({ match, index }) => {
    const matchNotes = getMatchNotes(match);
    if (matchNotes.length) {
      matchNotes.forEach((note) => {
        const color = getNoteColor(note);
        applyColorToNote(note, color, svgContainer.value);
      });
    }
  });
};

// Effacer tous les surlignages
const clearAllHighlighting = () => {
  if (!svgContainer.value) return;
  const noteElements = svgContainer.value.querySelectorAll<SVGElement>('.notehead');
  noteElements.forEach((element) => {
    element.setAttribute('fill', 'black');
  });
};

// Sélectionner tous les matches
const selectAllMatches = () => {
  selectedMatchIndices.value = matches.value.map((match, index) => ({ match, index }));
  refreshHighlighting();
};

// Désélectionner tous les matches
const deselectAllMatches = () => {
  selectedMatchIndices.value = [];
  refreshHighlighting();
};

// Surligner une note pendant la lecture
const highlightCurrentPlayingNote = (noteId: string) => {
  // Surligner la note actuelle
  if (!svgContainer.value) return;
  const currentNote = svgContainer.value.querySelector(`#${noteId}`);
  if (currentNote) {
    currentNote.classList.add('currently-playing');
  }
};

// Effacer le surlignage précédent lors de la lecture
const removeHighlightPreviousPlayingNote = () => {
  if (!svgContainer.value) return;
  const highlighted = svgContainer.value.querySelectorAll<HTMLElement>('.currently-playing');
  highlighted.forEach((el) => el.classList.remove('currently-playing'));
};

// Gestion de la lecture
const togglePlayback = async () => {
  if (isPlayingAudio.value) {
    pauseScore();
  } else if (isPausedAudio.value) {
    resumeScore();
  } else if (props.scoreData.meiXML) {
    await playScore(props.scoreData.meiXML, tempo.value);
  }
};

const stopPlayback = () => {
  stopScore();
  isPlayingAudio.value = false;
};

const updateTempo = () => {
  updateAudioTempo(tempo.value);
};

// Gestion de la modal
const closeModal = () => {
  stopPlayback();
  emit('close');
};

const handleOverlayClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    closeModal();
  }
};

// when the modal is opened, load the full score and set up watchers
watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      selectedMatchIndices.value = getIndexedMatches();
      renderScore();
      const appElement = document.getElementById('app');
      appElement?.classList.add('stop-scroll');
    } else {
      stopPlayback();
      const appElement = document.getElementById('app');
      appElement?.classList.remove('stop-scroll');
    }
  }
);

// Configuration du callback pour le surlignage pendant la lecture
onMounted(() => {
  setHighlightCallbacks(highlightCurrentPlayingNote, removeHighlightPreviousPlayingNote);
});

onUnmounted(() => {
  stopPlayback();
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  border-bottom: 2px solid #c0c0c0;
  flex-shrink: 0;
}

.modal-header h1 {
  flex: 1;
  text-align: center;
  font-size: 24px;
  margin: 0;
  color: #333;
}

.close-button {
  background: rgb(236, 95, 95);
  border-radius: 20%;
  font-size: 35px;
  cursor: pointer;
  color: black;
  font-weight: bold;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 5px;
  border: none;
}

.close-button:hover {
  color: #444;
}

.modal-content {
  background: white;
  border-radius: 10px;
  width: 90%;
  height: 90%;
  max-width: 1400px;
  max-height: 900px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-body {
  flex: 1;
  gap: 20px;
  overflow-y: auto;
  padding: 15px;
}

.playback-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  padding: 15px;
  margin-bottom: 15px;
  background: #f0f0f0;
  border-radius: 8px;
}

.play-button,
.stop-button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
}

.play-button {
  background: #28a745;
  color: white;
}

.play-button:hover {
  background: #218838;
}

.stop-button {
  background: #dc3545;
  color: white;
}

.stop-button:hover {
  background: #c82333;
}

.tempo-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tempo-control label {
  font-weight: bold;
  min-width: 100px;
}

.tempo-control input[type='range'] {
  width: 150px;
}

.score-details {
  display: flex;
  gap: 15px;
  width: 100%;
}

.results-details {
  position: sticky;
  display: flex;
  flex-direction: column;
  gap: 15px;
  top: 0px;
  height: fit-content;
}

.color-scale {
  padding: 15px;
  background: #f0f0f0;
  border-radius: 8px;
}

.color-scale h3 {
  margin: 0 0 10px 0;
  color: #000;
}

.color-gradient {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.gradient-bar {
  height: 20px;
  background: linear-gradient(to right, #ff0000, #d7d700, #00b300);
  border-radius: 10px;
  border: 2px solid #c0c0c0;
}

.gradient-labels {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  font-weight: bold;
  color: #000;
}

.match-controls {
  padding: 15px;
  background: #f0f0f0;
  border-radius: 8px;
}

.match-controls h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.control-button {
  margin: 5px 5px 10px 0;
  padding: 8px 15px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.3s;
}

.control-button:hover {
  background: #0056b3;
}

.match-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.match-item label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 500;
}

.match-item input[type='checkbox'] {
  width: 16px;
  height: 16px;
}

.score-display {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  background: white;
  border: 1px solid #c0c0c0;
  border-radius: 8px;
  padding: 20px;
  overflow: auto;
}

.score-footer {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.score-author {
  font-size: 16px;
  font-weight: bold;
  align-self: flex-end;
  padding: 5px;
}

.comment {
  font-weight: bold;
}

.svg-container {
  max-width: 100%;
  height: auto;
}

.svg-container :deep(svg) {
  max-width: 100%;
  height: auto;
}

/* Style pour la note actuellement jouée */
.svg-container :deep(.currently-playing .notehead) {
  fill: #ff6b6b !important;
  stroke: #ff6b6b !important;
  stroke-width: 2px !important;
}

.note-tooltip {
  position: absolute;
  background: rgba(0, 0, 0, 0.87);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 13px;
  pointer-events: none;
}

/* Animation pour la note jouée */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.svg-container :deep(.currently-playing) {
  animation: pulse 0.5s ease-in-out;
}
</style>
