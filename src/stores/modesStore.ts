// src/stores/modesStore.ts
import { defineStore } from 'pinia';

export const useModesStore = defineStore('modes', {
  state: () => {
    return {
      // List of all available modes (first item = "no filter")
      listeModes: <string[]>[
        'Tous les modes',
        'Ionian',
        'Dorian',
        'Phrygian',
        'Lydian',
        'Mixolydian',
        'Aeolian',
        'Locrian',
      ],
      selectedModeIndex: 0, // Index of the selected mode (default = "Tous les modes")
    };
  },
  getters: {
    /**
     * Get the name of the currently selected mode.
     * Returns an empty string if "Tous les modes" is selected
     * (so that the backend can ignore the filter).
     */
    selectedModeName: (state) => {
      if (state.selectedModeIndex === 0) {
        return null; // special case = no filter
      }
      return state.listeModes[state.selectedModeIndex] || null;
    },
  },
  actions: {
    /**
     * Set the current mode by index.
     * @param index - Index in the listeModes array
     */
    setMode(index: number) {
      if (index >= 0 && index < this.listeModes.length) {
        this.selectedModeIndex = index;
      }
    },
  },
});
