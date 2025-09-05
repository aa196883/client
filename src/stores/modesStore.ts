// src/stores/modesStore.ts
import { defineStore } from 'pinia';

export const useModesStore = defineStore('modes', {
  state: () => {
    return {
      // List of all available modes (first item = "no filter")
      listeModes: <string[]>[
        'Tous les modes',
        'Ionien',
        'Dorien',
        'Phrygien',
        'Lydien',
        'Mixolydien',
        'Éolien',
        'Locrien',
      ],
      selectedModeIndex: 0, // Index of the selected mode (default = "Tous les modes")
    };
  },
  getters: {
    selectedModeName: (state) => {
      if (state.selectedModeIndex === 0) {
        return null; // special case = no filter
      }

      // table de correspondance FR → EN
      const modeMap: Record<string, string> = {
        'Ionien': 'Ionian',
        'Dorien': 'Dorian',
        'Phrygien': 'Phrygian',
        'Lydien': 'Lydian',
        'Mixolydien': 'Mixolydian',
        'Éolien': 'Aeolian',
        'Locrien': 'Locrian',
      };

      const modeFr = state.listeModes[state.selectedModeIndex];
      return modeMap[modeFr] || null; // renvoie anglais pour le backend
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
