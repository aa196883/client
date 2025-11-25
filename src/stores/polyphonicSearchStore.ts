import { defineStore } from 'pinia';

export interface SerializedNote {
  keys: string[];
  duration: string;
  dots: number;
  noteType: string | null;
}

export interface FrozenVoiceParameters {
  mode: string | null;
  modeLabel: string | null;
  noteCount: number;
  pitchEnabled: boolean;
  rhythmEnabled: boolean;
}

export interface FrozenVoice {
  id: number;
  svgMarkup: string;
  notes: string;
  melody: SerializedNote[];
  parameters: FrozenVoiceParameters;
}

interface RemovedVoiceResult {
  voice: FrozenVoice;
  index: number;
}

export interface VoiceSearchPayload {
  notes: string;
  mode: string | null;
  noteCount: number;
  pitchEnabled: boolean;
  rhythmEnabled: boolean;
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
  }),
  getters: {
    normalizedAlpha(): number {
      return this.alpha / 100;
    },
    frozenVoicesPayload(state): VoiceSearchPayload[] {
      return state.voices.map((voice) => ({
        notes: voice.notes,
        mode: voice.parameters.mode,
        noteCount: voice.parameters.noteCount,
        pitchEnabled: voice.parameters.pitchEnabled,
        rhythmEnabled: voice.parameters.rhythmEnabled,
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
    },
    setIncipitOnly(value: boolean) {
      this.incipitOnly = value;
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
      melody: SerializedNote[];
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
        melody: payload.melody,
        parameters: {
          mode: payload.mode,
          modeLabel: payload.modeLabel,
          noteCount: payload.noteCount,
          pitchEnabled: this.pitchEnabled,
          rhythmEnabled: this.rhythmEnabled,
        },
      });

      return true;
    },
    removeFrozenVoice(voiceId: number): RemovedVoiceResult | null {
      const voiceIndex = this.voices.findIndex((voice) => voice.id === voiceId);
      if (voiceIndex === -1) {
        return null;
      }

      const [removedVoice] = this.voices.splice(voiceIndex, 1);
      this.reindexVoices();

      return { voice: removedVoice, index: voiceIndex };
    },
    restoreFrozenVoice(voice: FrozenVoice, index?: number) {
      const insertIndex =
        index === undefined || index < 0 || index > this.voices.length ? this.voices.length : index;
      this.voices.splice(insertIndex, 0, voice);
      this.reindexVoices();
    },
    applyFrozenVoiceParameters(parameters: FrozenVoiceParameters) {
      this.pitchEnabled = parameters.pitchEnabled;
      this.rhythmEnabled = parameters.rhythmEnabled;
    },
    reindexVoices() {
      this.voices = this.voices.map((voice, index) => ({ ...voice, id: index + 1 }));
    },
    clearFrozenVoices() {
      this.voices = [];
    },
  },
});
