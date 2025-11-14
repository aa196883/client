import { defineStore } from 'pinia';

export interface FrozenVoiceParameters {
  pitchDistance: number;
  durationFactor: number;
  durationGap: number;
  allowTransposition: boolean;
  allowHomothety: boolean;
  mode: string | null;
  modeLabel: string | null;
  noteCount: number;
}

export interface FrozenVoice {
  id: number;
  svgMarkup: string;
  notes: string;
  parameters: FrozenVoiceParameters;
}

export interface VoiceSearchPayload {
  notes: string;
  pitchDistance: number;
  durationFactor: number;
  durationGap: number;
  allowTransposition: boolean;
  allowHomothety: boolean;
  mode: string | null;
  noteCount: number;
}

function toNumber(value: string | number): number {
  const parsed = typeof value === 'string' ? Number(value) : value;
  return Number.isNaN(parsed) ? 0 : parsed;
}

export const usePolyphonicSearchStore = defineStore('polyphonicSearch', {
  state: () => ({
    voices: [] as FrozenVoice[],
    maxVoices: 4,
    pitchEnabled: true,
    rhythmEnabled: true,
    allowTransposition: false,
    allowHomothety: false,
    incipitOnly: false,
    pitchDistance: 0,
    durationFactor: 1,
    durationGap: 0,
    alpha: 0,
    lockedCollection: null as string | null,
    lockedAlpha: null as number | null,
    lockedIncipitOnly: null as boolean | null,
  }),
  getters: {
    sharedParametersLocked: (state) => state.voices.length > 0,
    sharedCollection: (state) => state.lockedCollection,
    sharedAlpha(state): number {
      return state.lockedAlpha ?? state.alpha;
    },
    sharedIncipit(state): boolean {
      return state.lockedIncipitOnly ?? state.incipitOnly;
    },
    normalizedAlpha(): number {
      return this.sharedAlpha / 100;
    },
    frozenVoicesPayload(state): VoiceSearchPayload[] {
      return state.voices.map((voice) => ({
        notes: voice.notes,
        pitchDistance: voice.parameters.pitchDistance,
        durationFactor: voice.parameters.durationFactor,
        durationGap: voice.parameters.durationGap,
        allowTransposition: voice.parameters.allowTransposition,
        allowHomothety: voice.parameters.allowHomothety,
        mode: voice.parameters.mode,
        noteCount: voice.parameters.noteCount,
      }));
    },
  },
  actions: {
    setPitchEnabled(value: boolean) {
      this.pitchEnabled = value;
      if (!value) {
        this.allowTransposition = false;
      }
    },
    setRhythmEnabled(value: boolean) {
      this.rhythmEnabled = value;
      if (!value) {
        this.allowHomothety = false;
      }
    },
    setAllowTransposition(value: boolean) {
      this.allowTransposition = value;
    },
    setAllowHomothety(value: boolean) {
      this.allowHomothety = value;
    },
    setPitchDistance(value: number | string) {
      this.pitchDistance = toNumber(value);
    },
    setDurationFactor(value: number | string) {
      const parsed = toNumber(value);
      this.durationFactor = parsed === 0 ? 1 : parsed;
    },
    setDurationGap(value: number | string) {
      this.durationGap = toNumber(value);
    },
    setAlpha(value: number | string) {
      const parsed = toNumber(value);
      this.alpha = parsed < 0 ? 0 : parsed;
      if (this.sharedParametersLocked && this.lockedAlpha !== null) {
        this.lockedAlpha = this.alpha;
      }
    },
    setIncipitOnly(value: boolean) {
      this.incipitOnly = value;
      if (this.sharedParametersLocked && this.lockedIncipitOnly !== null) {
        this.lockedIncipitOnly = value;
      }
    },
    resetActiveParameters() {
      this.pitchEnabled = true;
      this.rhythmEnabled = true;
      this.allowTransposition = false;
      this.allowHomothety = false;
      this.pitchDistance = 0;
      this.durationFactor = 1;
      this.durationGap = 0;
    },
    addFrozenVoice(payload: {
      svgMarkup: string;
      notes: string;
      mode: string | null;
      modeLabel: string | null;
      noteCount: number;
      collection: string;
    }): boolean {
      if (this.voices.length >= this.maxVoices) {
        return false;
      }

      const voiceId = this.voices.length + 1;
      this.voices.push({
        id: voiceId,
        svgMarkup: payload.svgMarkup,
        notes: payload.notes,
        parameters: {
          pitchDistance: this.pitchDistance,
          durationFactor: this.durationFactor,
          durationGap: this.durationGap,
          allowTransposition: this.allowTransposition,
          allowHomothety: this.allowHomothety,
          mode: payload.mode,
          modeLabel: payload.modeLabel,
          noteCount: payload.noteCount,
        },
      });

      if (!this.sharedParametersLocked) {
        this.lockedCollection = payload.collection;
        this.lockedAlpha = this.alpha;
        this.lockedIncipitOnly = this.incipitOnly;
      }

      return true;
    },
    clearFrozenVoices() {
      this.voices = [];
      this.lockedCollection = null;
      this.lockedAlpha = null;
      this.lockedIncipitOnly = null;
    },
  },
});
