// src/stores/authorsStore.ts
import { defineStore } from 'pinia';
import { fetchAuthors } from '@/services/dataBaseQueryServices.ts';

export const useAuthorsStore = defineStore('authors', {
  state: () => {
    return {
      listeAuthors: <string[]>['chargement'],
      selectedAuthorIndex: 0, // Index of the selected author
      loaded: false, // Indicates if the authors have been loaded
    }; // Initialize with a default value (print "chargement" while fetching data)
  },
  getters: {
    selectedAuthorName: (state) => {
      return state.listeAuthors[state.selectedAuthorIndex] || '';
    },
  },
  actions: {
    /**
     * Set the authors list
     * @param newAuthors - The new list of authors
     */
    setAuthors(newAuthors: string[]) {
      this.listeAuthors = newAuthors;
    },
    /**
     * Set the selected author index.
     * @param index - The index of the selected author.
     */
    setSelectedAuthorIndex(index: number) {
      this.selectedAuthorIndex = index;
    },

    /**
     * Load authors from the server and update the store
     * only if authors have not been loaded yet.
     */
    async loadAuthors() {
      if (!this.loaded) {
        try {
          const data = await fetchAuthors();
          this.setAuthors(data);
        } catch (error) {
          console.error('Failed to load authors:', error);
        }
      }
    },
  },
});
