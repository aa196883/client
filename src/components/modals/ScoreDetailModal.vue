<template>
  <div v-if="isOpen" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>

      <!-- Titre et close button -->
      <div class="modal-header">
        <h1 class="modal-title">{{ scoreData.title || 'Partition' }}</h1>
        <button class="close-button" @click="closeModal">×</button>
      </div>

      <!-- Affichage de la lecture, de la partition et des statistiques -->
      <div class="modal-body">

        <!-- Contrôles de la lecture -->
        <div class="playback-controls">

          <!-- Bouttons -->
          <button @click="togglePlayback" class="play-button">{{ playStatus }}</button>
          <button @click="stopPlayback" class="stop-button">Stop</button>

          <!-- Règlement du tempo -->
          <div class="tempo-control">
            <label>Tempo : {{ tempo }} BPM</label>
            <input type="range" step="10" min="60" max="200" v-model="tempo" @input="updateTempo" />
          </div>
        </div>

        <!-- Affichage général (partition, commentaire, auteur, statistiques) -->
        <div class="score-details">
          <div class="score-display">
            <!-- Partition (svg) -->
            <div v-html="scoreSvg" class="svg-container" ref="svgContainer"></div>
            <!-- Footer (commentaire, auteur) -->
            <div class="score-footer">
              <h6 v-if="scoreData.author" class="score-author">{{ scoreData.author }}</h6>
              <p v-if="scoreData.comment" class="score-comment">
                <span class="comment">Commentaire :</span> <br />
                {{ scoreData.comment }}
              </p>
            </div>
            <!-- Affichage des statistiques -->
            <div class="stats-display">
              <!-- Titre et choix de la voix -->
              <div class="stats-header">
                <!-- Titre -->
                <h3 class="stats-title">Statistiques</h3>
                <h6 class="stats-subtitle">En cours de développement</h6>
                <!-- Voix -->
                <div v-if="totalVoices > 1" class="stats-voice">
                  <label>Voix : </label>
                  <select v-model="selectedVoice" @change="loadStats" class="voice-select">
                    <option v-for="n in totalVoices" :key="n" :value="n">
                      {{ n }}
                    </option>
                  </select>
                </div>
              </div>
              <!-- Attendre le chargement des statistiques avant affichage -->
              <div v-if="isLoaded && stats">
                <!-- Anacrouse, nombre de mesures, ambitus, finale -->
                <div class="global-stats">
                  <!-- Anacrouse -->
                  <div class="global-stat">
                    <h5 class="global-stat-title">Anacrouse</h5>
                    <span class="global-stat-value">{{ stats.has_anacrusis[0]?.has_anacrusis ? 'Oui' : 'Non' }}</span>
                  </div>
                  <!-- Nombre de mesures -->
                  <div class="global-stat">
                    <h5 class="global-stat-title">Mesures</h5>
                    <span class="global-stat-value">{{ stats.get_nb_measures[0]?.nb_measures }}</span>
                  </div>
                  <!-- Ambitus -->
                  <div class="global-stat">
                    <h5 class="global-stat-title">Ambitus</h5>
                    <span class="global-stat-value" v-if="stats.get_ambitus && stats.get_ambitus[0]">
                      {{ formatNote(stats.get_ambitus[0].lowest_note) }}
                      -
                      {{ formatNote(stats.get_ambitus[0].highest_note) }}
                    </span>
                  </div>
                  <!-- Finale -->
                  <div class="global-stat">
                    <h5 class="global-stat-title">Finale</h5>
                    <span class="global-stat-value">{{ formatNote(stats.get_last_note[0]?.last_note) }}</span>
                  </div>
                  <!-- Silences -->
                  <div class="global-stat">
                    <h5 class="global-stat-title">silences</h5>
                    <span class="global-stat-value">{{ stats.get_nb_rests[0]?.nb_rests }}</span>
                  </div>
                </div>
                <!-- Valeurs rythmiques, fréquence d'apparition, notes en début de mesure -->
                <!-- Pour ajouter une section aux statistiques, l'implémenter au grid-template-areas et au mapping dans le CSS
                      Puis utiliser la classe correspondante -->
                <div class="stats-grid">
                  <!-- Valeurs rythmmiques -->
                  <div class="stats-card_rythmic-values">
                    <h5 class="stat-card-title">Valeurs rythmiques</h5>
                    <table class="stat-table">
                      <thead>
                        <th>Valeur</th>
                        <th>Occurences</th>
                      </thead>
                      <tbody>
                        <tr v-for="v in stats.get_rythmic_value_occurences" :key="v.value">
                          <td>{{ v.value }}</td>
                          <td>{{ v.nb_occurences }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <!-- Intervalles diatoniques -->
                  <div class="stats-card_diatonic-intervals">
                    <h5 class="stat-card-title">Intervalles diatoniques</h5>
                    <table class="stat-table">
                      <thead>
                        <th>Valeur</th>
                        <th>Occurences</th>
                      </thead>
                      <tbody>
                        <tr v-for="v in stats.get_diatonic_intervals" :key="v.value">
                          <td>{{ v.value }}</td>
                          <td>{{ v.nb_occurences }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <!-- Fréquence d'apparition des notes -->
                  <div class="stats-card_note-occurences">
                    <h5 class="stat-card-title">Fréquence d'apparition des notes</h5>
                    <div class="stat-badges">
                      <div class="stat-badge" v-for="n in stats.get_exact_pitch_occurences" :key="n.note">
                        <span class="stat-badge-value">{{ formatNote(n.note) }}</span>
                        <span class="stat-badge-detail">{{ n.nb_occurences }}</span>
                      </div>
                    </div>
                  </div>
                  <!-- Notes en début de mesure -->
                  <div class="stats-card_first-notes-of-measure">
                    <h5 class="stat-card-title">Notes en début de mesure</h5>
                    <div class="stat-badges">
                      <div class="stat-badge" v-for="n in stats.get_first_note_of_measure_occurences" :key="n.note">
                        <!-- <span class="stat-badge-value">{{ n.first_note == 'rest' ? 'Silence' : n.first_note }}</span> -->
                        <span class="stat-badge-value">{{ formatNote(n.note) }}</span>
                        <span class="stat-badge-detail">{{ n.nb_occurences }}</span>
                      </div>
                    </div>
                  </div>
                  <!-- Poids temporel des notes -->
                  <div class="stats-card_note-times">
                    <h5 class="stat-card-title">Poids temporel des notes</h5>
                    <table class="stat-table">
                      <thead>
                        <th>Note</th>
                        <th>Durée Totale</th>
                        <th>% Temps joué</th>
                        <th>Durée Moyenne</th>
                        <th v-if="hasChords">Durée totale au sein d'un accord</th>
                      </thead>
                      <tbody>
                        <tr v-for="n in stats.get_note_duration_stats" :key="n.note">
                          <td><strong>{{ formatNote(n.note) }}</strong></td>
                          <td>{{ n.total_duration }}</td>
                          <td>
                            <div class="progress-bar">
                              <div class="progress-fill" :style="{ width: n.note_duration_percentage + '%' }"></div>
                              <span class="progress-bar-percentage">{{ n.note_duration_percentage }}%</span>
                            </div>
                          </td>
                          <td>{{ n.average_duration }}</td>
                          <td v-if="hasChords">
                            <strong>{{ n.total_duration_within_chords }}</strong>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div v-else class="stats-loading">
                Chargement des données musicales...
              </div>
            </div>
            <!-- Affichage de l'analyse -->
            <div class="stats-display">
              <div class="stats-header">
                <!-- Titre -->
                <h3 class="stats-title">Analyse</h3>
                <h6 class="stats-subtitle">En cours de développement</h6>
              </div>
              <!-- Attendre le chargement des statistiques avant affichage -->
              <div v-if="isLoaded && stats">
                <!-- Gamme -->
                <div class="global-stats">
                  <!-- Gamme -->
                  <div class="global-stat">
                    <h5 class="global-stat-title">Gamme</h5>
                    <span class="global-stat-value">{{ stats.get_scale?.scale }}</span>
                  </div>
                </div>
              </div>
              <div v-else class="stats-loading">
                Chargement des données musicales...
              </div>
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
                    <input type="checkbox" v-model="selectedMatchIndices" :value="{ match, index }"
                      @change="refreshHighlighting" />
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
        <p class="note-info-title">Résultat n° {{ hoveredNote.id }}</p>
        <p>Satisfaction globale de la note : {{ hoveredNote.note_deg }}%</p>
        <p>Satisfaction en hauteur : {{ hoveredNote.pitch_deg }}%</p>
        <p>Satisfaction en durée : {{ hoveredNote.duration_deg }}%</p>
        <p>Satisfaction de l'enchaînement : {{ hoveredNote.sequencing_deg }}%</p>
        <p v-for="membershipFunction in hoveredNote.membershipFunctionDegrees" :key="membershipFunction.name">
          {{ membershipFunction.name }}: {{ membershipFunction.degree }}%
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, ref, watch, onMounted, onUnmounted, nextTick, computed, type PropType } from 'vue';
import { fetchStatResults } from '@/services/dataBaseQueryServices';
import { useVerovioStore } from '@/stores/verovioStore';
import { useAudioPlayer } from '@/composables/useAudioPlayer';
import {
  getScoreMatches as extractScoreMatches,
  getMatchNotes,
  applyColorToNote,
  getNoteColor,
} from '@/services/resultProcessingService';
import type { Match, Note, DataResults } from '@/types/api';

// 1. Définition des PROPS
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

// 2. Définition des EMITS
const emit = defineEmits(['close']);

// 3. LOGIQUE PRINCIPALE
// Stores & Composables
const verovio = useVerovioStore();
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

// État Réactif
const selectedVoice = ref(1);
const stats = ref<any>(null);
const isLoaded = ref(false);
const totalVoices = ref(1);
const scoreSvg = ref('');
const selectedMatchIndices = ref<{ match: Match; index: number }[]>([]);
const tempo = ref(120);
const svgContainer = ref<HTMLElement | null>(null);
const isNoteInfoShown = ref(false);
const tooltipDiv = ref<HTMLElement | null>(null);
const hoveredNote = ref<any>({});

const formatDegreeAsPercentage = (degree: number): number => Math.floor(degree * 100);

const getMembershipFunctionDegrees = (note: Note): { name: string; degree: number }[] => {
  if (!note.membership_functions_degrees) return [];

  return Object.entries(note.membership_functions_degrees)
    .filter(([, degree]) => typeof degree === 'number' && Number.isFinite(degree))
    .map(([name, degree]) => ({
      name,
      degree: formatDegreeAsPercentage(degree),
    }));
};

// --- Computed Properties ---
const matches = computed(() => extractScoreMatches(props.scoreData));

const playStatus = computed(() => {
  if (isPlayingAudio.value) return 'Pause';
  if (isPausedAudio.value) return 'Reprendre';
  return 'Jouer';
});

const hasChords = computed(() => {
  return stats.value?.get_note_duration_stats?.some(
    (n: any) => n.total_duration_within_chords > 0
  );
});

// --- Méthodes ---
const loadStats = async () => {
  if (!props.scoreData.source) return;

  // On NE vide PAS stats.value ici pour laisser l'ancien affichage 
  // jusqu'à ce que le nouveau soit prêt, ou on utilise isLoaded.
  isLoaded.value = false;

  try {
    const data = await fetchStatResults(props.scoreData.source, selectedVoice.value);
    if (data) {
      stats.value = data;

      // On met à jour le nombre de voix seulement s'il est présent
      if (data.get_nb_voices?.[0]?.nb_voices) {
        totalVoices.value = data.get_nb_voices[0].nb_voices;
      }

      isLoaded.value = true;
    }
  } catch (err) {
    console.error("Erreur chargement stats", err);
  }
};

const closeModal = () => {
  stopPlayback();
  emit('close');
};

const handleOverlayClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) closeModal();
};

const renderScore = async () => {
  if (!props.scoreData.meiXML) return;
  await verovio.ensureTkInitialized();
  const options = {
    pageHeight: 60000,
    pageWidth: 1600,
    scale: 40,
    adjustPageHeight: true,
  };
  verovio.tk.setOptions(options);
  verovio.tk.loadData(props.scoreData.meiXML);
  scoreSvg.value = verovio.tk.renderToSVG(1);
  await nextTick();
  refreshHighlighting();
  initNoteHoverInfo();
};

const refreshHighlighting = async () => {
  await nextTick();
  clearAllHighlighting();
  if (!matches.value.length || selectedMatchIndices.value.length === 0) return;

  const sorted = [...selectedMatchIndices.value].sort((a, b) => b.index - a.index);
  sorted.forEach(({ match }) => {
    getMatchNotes(match).forEach((note) => {
      applyColorToNote(note, getNoteColor(note), svgContainer.value);
    });
  });
};

const clearAllHighlighting = () => {
  if (!svgContainer.value) return;
  svgContainer.value.querySelectorAll('.notehead').forEach((el) => {
    el.setAttribute('fill', 'black');
  });
};

const selectAllMatches = () => {
  selectedMatchIndices.value = matches.value.map((match, index) => ({ match, index }));
  refreshHighlighting();
};

const deselectAllMatches = () => {
  selectedMatchIndices.value = [];
  refreshHighlighting();
};

const initNoteHoverInfo = () => {
  const svg = svgContainer.value;
  if (!svg) return;
  matches.value.forEach((match, index) => {
    getMatchNotes(match).forEach((note) => {
      const el = svg.querySelector(`#${note.id} .notehead`);
      if (el) {
        el.addEventListener('mouseover', (e) => showNoteInfo(e as MouseEvent, match, index, note));
        el.addEventListener('mouseout', () => {
          isNoteInfoShown.value = false;
          hoveredNote.value = {};
        });
      }
    });
  });
};

const showNoteInfo = async (event: MouseEvent, match: Match, index: number, note: Note) => {
  const isSelected = selectedMatchIndices.value.some(m => m.index === index);
  if (!isSelected) return;
  hoveredNote.value = {
    id: index + 1,
    note_deg: formatDegreeAsPercentage(note.note_deg),
    pitch_deg: formatDegreeAsPercentage(note.pitch_deg),
    duration_deg: formatDegreeAsPercentage(note.duration_deg),
    sequencing_deg: formatDegreeAsPercentage(note.sequencing_deg),
    membershipFunctionDegrees: getMembershipFunctionDegrees(note),
  };
  isNoteInfoShown.value = true;
  await nextTick();
  if (tooltipDiv.value) {
    tooltipDiv.value.style.top = `${event.pageY + 10}px`;
    tooltipDiv.value.style.left = `${event.pageX + 10}px`;
  }
};

const togglePlayback = async () => {
  if (isPlayingAudio.value) pauseScore();
  else if (isPausedAudio.value) resumeScore();
  else if (props.scoreData.meiXML) await playScore(props.scoreData.meiXML, tempo.value);
};

const stopPlayback = () => {
  stopScore();
};

const updateTempo = () => updateAudioTempo(tempo.value);

interface MusicNote {
  class: string;
  octave: number;
  accid?: string | null; // Peut être 's', 'f', null ou undefined
}

const formatNote = (noteObj: MusicNote | undefined | null): string => {
  if (!noteObj) return '';

  if (!noteObj.class) {
    return noteObj.octave ? `(${noteObj.octave})` : 'Silence';
  }

  // On définit le type des clés autorisées pour l'indexation
  const accidMap: Record<string, string> = {
    's': '♯',
    'f': '♭',
    'n': ''
  };

  // On récupère l'altération
  const accidKey = noteObj.accid;
  const accidSymbol = accidKey ? (accidMap[accidKey]) : '';
  const className = noteObj.class.toUpperCase();

  return `${className}${accidSymbol}${noteObj.octave}`;
};

// Watchers
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    selectedVoice.value = 1;
    loadStats();
    selectedMatchIndices.value = matches.value.map((match, index) => ({ match, index }));
    renderScore();
    document.getElementById('app')?.classList.add('stop-scroll');
  } else {
    stopPlayback();
    document.getElementById('app')?.classList.remove('stop-scroll');
  }
});

// Lifecycle
onMounted(() => {
  setHighlightCallbacks(
    (id) => svgContainer.value?.querySelector(`#${id}`)?.classList.add('currently-playing'),
    () => svgContainer.value?.querySelectorAll('.currently-playing').forEach(el => el.classList.remove('currently-playing'))
  );
});

onUnmounted(() => stopPlayback());

</script>

<style scoped>
/* ==========================================================================
   1. VARIABLES ET RESET
   ========================================================================== */

* {
  box-sizing: border-box;
}

.modal-content {
  /* Couleurs générales */
  --background-color: #fff;
  --border-color: #c0c0c0;
  --header-one-color: #333;

  /* Boutons de fermeture */
  --close-button-color: rgb(236, 95, 95);
  --close-button-x-color: #000;

  /* Contrôles de lecture */
  --secondary-background-color: #f0f0f0;
  --play-button-background-color: #28a745;
  --play-button-color: #fff;
  --stop-button-background-color: #dc3545;
  --stop-button-color: #fff;

  /* Statistiques et Cartes */
  --accent-color: #006496;
  --global-stat-title-color: #8e8e8e;
  --stat-item-background-color: #fff;
  --box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  --box-border: 1px solid rgba(0, 0, 0, 0.02);
  --table-accent-color: #f0f0f0;

  /* Badges et Barres de progression */
  --stat-badge-background-color: #0076b1;
  --stat-badge-color: #ffffff;
  --stat-badge-detail-background-color: rgba(255, 255, 255, 0.3);
  --stat-badge-detail-color: #ffffff;
  --progress-bar-background: #EAFAEE;
  --progress-bar-fill: #28a745;
  --progress-bar-percentage-color: #353535;

  /* Résultat de recherche */
  --satisfaction-low: var(--stop-button-background-color);
  --satisfaction-mid: #ffd43b;
  --satisfaction-high: var(--play-button-background-color);
}

/* ==========================================================================
   2. STRUCTURE DE LA MODALE (LAYOUT)
   ========================================================================== */

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

.modal-content {
  background: var(--background-color);
  border-radius: 10px;
  width: 90%;
  height: 90vh;
  max-width: 1400px;
  max-height: 900px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  margin: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 2px solid var(--border-color);
  flex-shrink: 0;
}

.modal-body {
  flex: 1;
  gap: 20px;
  overflow-y: auto;
  scrollbar-width: thin;
  padding: 15px;
  width: 100%;
}

.score-details {
  display: flex;
  gap: 15px;
  width: 100%;
}

/* ==========================================================================
   3. ÉLÉMENTS DU HEADER (TITRE & CLOSE)
   ========================================================================== */

.modal-title {
  flex: 1;
  text-align: center;
  font-size: 24px;
  margin: 0;
  color: var(--header-one-color);
}

.close-button {
  background: var(--close-button-color);
  border-radius: 20%;
  font-size: 35px;
  cursor: pointer;
  color: var(--close-button-x-color);
  font-weight: 700;
  padding: 0 0 5px 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
}

/* ==========================================================================
   4. CONTRÔLES DE LECTURE (PLAYBACK)
   ========================================================================== */

.playback-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 15px;
  padding: 15px;
  margin-bottom: 15px;
  background: var(--secondary-background-color);
  border-radius: 10px;
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
  background: var(--play-button-background-color);
  color: var(--play-button-color);
}

.stop-button {
  background: var(--stop-button-background-color);
  color: var(--stop-button-color);
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

/* ==========================================================================
   5. AFFICHAGE DE LA PARTITION (SVG)
   ========================================================================== */

.score-display {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 20px;
  overflow-y: auto;
  overflow-x: hidden;
}

.score-display>div {
  width: 100%;
}

.svg-container {
  max-width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow-x: auto;
  padding: 20px 0;
}

/* Sélecteurs profonds pour le SVG dynamique */
.svg-container :deep(svg) {
  max-width: 100%;
  height: auto;
}

.svg-container :deep(.currently-playing) {
  animation: pulse 0.5s ease-in-out;
}

.svg-container :deep(.currently-playing .notehead) {
  fill: var(--playing-note-color) !important;
  stroke: var(--playing-note-color) !important;
  stroke-width: 2px !important;
}

.score-footer {
  width: 100%;
}

.score-author {
  font-size: 16px;
  font-weight: bold;
  text-align: right;
  margin: 10px 0px;
}

.comment {
  font-weight: bold;
}

/* ==========================================================================
   6. ZONE DES STATISTIQUES (ANALYSE)
   ========================================================================== */

.stats-display {
  text-align: left;
  background: var(--secondary-background-color);
  padding: 15px;
  border-radius: 10px;
  overflow: auto;
  margin: 10px
}

.stats-loading {
  margin: 10px
}

/* Header des stats (Titre + Sélecteur de voix) */
.stats-header {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid var(--accent-color);
  margin: 10px;
}

.stats-title {
  margin: 10px 0 20px 0;
  font-weight: bold;
  color: var(--accent-color);
  font-size: 1.5em;
}

.stats-subtitle {
  margin: 10px 0 20px 0;
  font-weight: bold;
  color: var(--global-stat-title-color);
  font-size: 1.2em;
}

.stats-voice {
  margin: 10px 0 20px 0;
}

.voice-select {
  padding: 5px;
  margin-left: 10px;
  width: 4em;
}

/* --- Stats Globales (Grille du haut) --- */
.global-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
}

.global-stat {
  text-align: center;
  padding: 20px 10px;
  margin: 10px;
  border-radius: 8px;
  background-color: var(--stat-item-background-color);
  box-shadow: var(--box-shadow);
  border: var(--box-border);
}

.global-stat-title {
  margin: 0;
  text-transform: uppercase;
  font-size: 0.75em;
  font-weight: normal;
  letter-spacing: 1px;
  color: var(--global-stat-title-color);
}

.global-stat-value {
  font-weight: bold;
  color: var(--accent-color);
}

/* --- Grille de détails (Tableaux et Badges) --- */
.stats-grid {
  display: grid;
  grid-template-areas:
    'SC_diatonic-intervals SC_diatonic-intervals SC_rythmic-values SC_rythmic-values'
    'SC_first-notes-of-measure SC_first-notes-of-measure SC_note-occurences SC_note-occurences'
    'SC_note-times SC_note-times SC_note-times SC_note-times';
}

.stats-grid>div {
  padding: 20px;
  margin: 10px;
  border-radius: 8px;
  background-color: var(--stat-item-background-color);
  box-shadow: var(--box-shadow);
  border: var(--box-border);
}

/* Mapping des zones de la grille */
.stats-card_rythmic-values {
  grid-area: SC_rythmic-values;
}

.stats-card_note-occurences {
  grid-area: SC_note-occurences;
}

.stats-card_first-notes-of-measure {
  grid-area: SC_first-notes-of-measure;
}

.stats-card_note-times {
  grid-area: SC_note-times;
}

.stats-card_diatonic-intervals {
  grid-area: SC_diatonic-intervals;
}

.stat-card-title {
  margin: 0 0 15px 0;
  font-size: 1.1em;
  color: var(--accent-color);
  padding-left: 10px;
}

/* ==========================================================================
   7. COMPOSANTS RÉUTILISABLES (TABLES, BADGES, PROGRESS)
   ========================================================================== */

/* Tableaux */
.stat-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9em;
}

.stat-table th {
  text-align: left;
  font-weight: 600;
  padding: 8px;
  border-bottom: 2px solid var(--table-accent-color);
}

.stat-table td {
  padding: 8px;
  border-bottom: 1px solid var(--table-accent-color);
}

.stat-table tr:hover {
  background-color: var(--table-accent-color);
}

/* Badges de notes */
.stat-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.stat-badge {
  display: flex;
  align-items: center;
  background-color: var(--stat-badge-background-color);
  color: var(--stat-badge-color);
  padding: 4px 4px 4px 12px;
  border-radius: 20px;
  font-size: 0.9em;
  transition: transform 0.2s;
}

.stat-badge:hover {
  transform: translateY(-2px);
}

.stat-badge-value {
  font-weight: bold;
  margin-right: 8px;
  text-transform: capitalize;
}

.stat-badge-detail {
  background-color: var(--stat-badge-detail-background-color);
  color: var(--stat-badge-detail-color);
  min-width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 0.8em;
  font-weight: bold;
}

/* Barres de progression */
.progress-bar {
  background: var(--progress-bar-background);
  border-radius: 10px;
  height: 15px;
  position: relative;
  overflow: hidden;
}

.progress-fill {
  background: var(--progress-bar-fill);
  height: 100%;
}

.progress-bar-percentage {
  position: absolute;
  right: 5px;
  top: 0;
  font-size: 0.7rem;
  line-height: 15px;
  color: var(--progress-bar-percentage-color);
}

/* ==========================================================================
   8. AFFICHE DES RESULTATS DE RECHERCHE
   ========================================================================== */
/* --- SECTION RÉSULTATS (STICKY) --- */
.results-details {
  position: sticky;
  display: flex;
  flex-direction: column;
  gap: 20px;
  top: 0;
  height: fit-content;
}

/* --- ÉCHELLE DE SATISFACTION --- */
.color-scale {
  background: var(--secondary-background-color);
  padding: 15px;
  border-radius: 10px;
  overflow: auto;
}

.color-scale h3 {
  margin: 0 0 10px 0;
  color: var(--accent-color);
  letter-spacing: 0.5px;
  font-weight: bold;
  font-size: 1.5em;
}

.color-gradient {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.gradient-bar {
  height: 14px;
  background: linear-gradient(to right,
      var(--satisfaction-low),
      var(--satisfaction-mid),
      var(--satisfaction-high));
  border-radius: 10px;
  border: 1px solid var(--border-color);
}

.gradient-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 12px;
  font-weight: bold;
  color: var(--header-one-color);
}

/* --- LISTE DES MATCHES (RÉSULTATS) --- */
.match-controls {
  background: var(--secondary-background-color);
  padding: 15px;
  border-radius: 10px;
  overflow: auto;
}

.match-controls h3 {
  margin: 0 0 10px 0;
  color: var(--accent-color);
  letter-spacing: 0.5px;
  font-weight: bold;
  font-size: 1.5em;
}

.match-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 350px;
  /* Évite que la modal soit trop longue */
  overflow-y: auto;
  margin-top: 10px;
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

/* Style des boutons "Tout sélectionner" */
.control-button {
  background: var(--background-color);
  border: 1px solid var(--border-color);
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  margin: 5px 5px 10px 0;
  transition: 0.2s;
}

/* --- TOOLTIP DES NOTES --- */

.note-tooltip {
  --playing-note-color: #ff6b6b;
  --note-tooltip-background-color: rgba(0, 0, 0, 0.85);
  --note-tooltip-color: #fff;
  --item-hover-bg: var(--table-accent-color);
}

.note-tooltip {
  position: absolute;
  background: var(--note-tooltip-background-color);
  color: var(--note-tooltip-color);
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 13px;
  pointer-events: none;
}

/* Mise en évidence du titre dans le tooltip */
.note-info-title {
  font-weight: bold;
  margin-bottom: 10px;
}

.note-info p {
  margin: 5px 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ==========================================================================
   9. ANIMATIONS & ÉTATS (HOVER, KEYFRAMES)
   ========================================================================== */

button:hover {
  box-shadow: inset 0 0 0 100px rgba(0, 0, 0, 0.15);
}

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

/* ==========================================================================
   10. MÉDIA QUERIES (RESPONSIVE)
   ========================================================================== */

@media (max-width: 900px) {
  .stats-grid {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
}
@media (max-width: 700px) {
  .global-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 400px) {
  .global-stats {
    grid-template-columns: 1fr;
  }
}
</style>
