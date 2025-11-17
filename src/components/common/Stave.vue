<template>
  <div class="stave-wrapper">
    <div class="active-stave-row">
      <div class="active-stave">
        <div id="music-score"></div>
        <div class="clear_buttons">
          <button @click="handleClearAll" type="button" class="btn btn-info text-white">Supprimer tout</button>
          <button @click="staveRepr.remove_last_note()" type="button" class="btn btn-info text-white">
            Supprimer la dernière note
          </button>
          <button
            type="button"
            class="btn btn-info text-white"
            v-if="player.is_playing.value"
            @click="player.stopMelody()"
            id="stop_melody"
          >
            Arrêter la mélodie
          </button>
          <button v-else @click="player.playMelody(staveRepr.melody)" type="button" class="btn btn-info text-white">
            Jouer la mélodie
          </button>
        </div>
      </div>
      <button
        class="btn btn-outline-secondary add-stave"
        type="button"
        @click="freezeCurrentStave"
        :disabled="polyphonicStore.voices.length >= polyphonicStore.maxVoices"
      >
        Ajouter une portée
      </button>
    </div>

    <p v-if="showMaxVoicesWarning" class="max-voices-warning">
      Nombre maximum de portées ({{ polyphonicStore.maxVoices }}) atteint.
    </p>

    <div v-if="polyphonicStore.voices.length" class="frozen-staves">
      <div v-for="voice in polyphonicStore.voices" :key="voice.id" class="frozen-stave">
        <div class="frozen-stave-header">
          <span>Voix {{ voice.id }}</span>
          <span v-if="voice.parameters.modeLabel" class="mode-label">Mode : {{ voice.parameters.modeLabel }}</span>
        </div>
        <div class="frozen-stave-score" v-html="voice.svgMarkup"></div>
        <div class="frozen-stave-parameters">
          <span>Tolérance hauteur : {{ voice.parameters.pitchDistance }}</span>
          <span>Facteur de durée : {{ voice.parameters.durationFactor }}</span>
          <span>Écart de durée : {{ voice.parameters.durationGap }}</span>
          <span>Transposition : {{ voice.parameters.allowTransposition ? 'Oui' : 'Non' }}</span>
          <span>Homothétie : {{ voice.parameters.allowHomothety ? 'Oui' : 'Non' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Player from '@/lib/player.js';
import StaveRepresentation from '@/lib/stave.js';
import { computed, onMounted } from 'vue';
import { usePolyphonicSearchStore } from '@/stores/polyphonicSearchStore.ts';
import { useModesStore } from '@/stores/modesStore.ts';
import { useAuthorsStore } from '@/stores/authorsStore.ts';
import { createNotesQueryParam } from '@/services/dataManagerServices';

defineOptions({
  name: 'Stave',
});

const staveRepr = StaveRepresentation.getInstance();
const player = Player.getInstance();
const polyphonicStore = usePolyphonicSearchStore();
const modes = useModesStore();
const authors = useAuthorsStore();

const showMaxVoicesWarning = computed(
  () => polyphonicStore.voices.length >= polyphonicStore.maxVoices,
);

function keyListener(event) {
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
    // Ignore key events if the target is an input or textarea
    return;
  }
  //---Delete all
  if (event.key == 'Backspace' && event.ctrlKey) {
    staveRepr.clear_all_pattern();
  }
  //---Delete last note
  else if (event.key == 'Backspace') {
    staveRepr.remove_last_note();
  }
  //---Play melody
  else if (event.key == 'p' && !event.repeat) {
    event.preventDefault(); // prevent scrolling
    if (player.is_playing.value) {
      player.stopMelody();
    } else {
      player.playMelody(staveRepr.melody);
    }
  }
}

onMounted(() => {
  staveRepr.init();

  // bind keyboard events
  document.addEventListener('keydown', keyListener);
});

function handleClearAll() {
  staveRepr.clear_all_pattern();
}

function freezeCurrentStave() {
  if (staveRepr.melody.length === 0) {
    return;
  }

  if (polyphonicStore.voices.length >= polyphonicStore.maxVoices) {
    alert(`Nombre maximum de portées (${polyphonicStore.maxVoices}) atteint.`);
    return;
  }

  const container = document.getElementById('music-score');
  const svgElement = container?.querySelector('svg');
  if (!svgElement) {
    return;
  }

  const notesQueryParam = createNotesQueryParam(
    staveRepr.melody,
    !polyphonicStore.pitchEnabled,
    !polyphonicStore.rhythmEnabled,
  );

  const success = polyphonicStore.addFrozenVoice({
    svgMarkup: svgElement.outerHTML,
    notes: notesQueryParam,
    mode: modes.selectedModeName,
    modeLabel: modes.listeModes[modes.selectedModeIndex] ?? null,
    noteCount: staveRepr.melody.length,
    collection: authors.selectedAuthorName,
  });

  if (!success) {
    alert(`Nombre maximum de portées (${polyphonicStore.maxVoices}) atteint.`);
    return;
  }

  staveRepr.clear_all_pattern();
}
</script>

<style scoped>
.stave-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.active-stave-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.active-stave {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.add-stave {
  height: fit-content;
  align-self: center;
}

#stop_melody {
  background: red;
}
.clear_buttons button {
  background: #7ab6e0;
}
.clear_buttons {
  align-self: center;
  display: flex;
  justify-content: center;
  gap: 10px;
}

.frozen-staves {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.frozen-stave {
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.frozen-stave-header {
  display: flex;
  justify-content: space-between;
  font-weight: 600;
}

.mode-label {
  font-style: italic;
}

.frozen-stave-score svg {
  width: 100%;
  height: auto;
}

.frozen-stave-parameters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 4px 12px;
  font-size: 0.9rem;
}

.max-voices-warning {
  color: #c0392b;
  font-weight: 600;
}
</style>
