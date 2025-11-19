import { ref, onUnmounted } from 'vue';
import * as Tone from 'tone';

interface PlaybackNote {
  pitch: string;
  duration: string;
  id: string;
}

interface PlaybackEvent {
  time: number;
  notes: PlaybackNote[];
}

/**
 * Composable pour la gestion de la lecture audio avec Tone.js
 */
export function useAudioPlayer() {
  const isPlayingAudio = ref(false);
  const isPausedAudio = ref(false);
  const isStoppedAudio = ref(true);
  let highlightCallback: ((ids: string[]) => void) | null = null;
  let removeHighlightCallback: (() => void) | null = null;

  let synth: Tone.Synth | null = null;
  let part: Tone.Part | null = null;

  /**
   * Initialise Tone.js et crée un synthétiseur
   */
  const initializeTone = async () => {
    if (Tone.getContext().state !== 'running') {
      await Tone.start();
    }

    if (!synth) {
      synth = new Tone.Synth().toDestination();
    }
  };

  /**
   * Parse le MEI XML pour extraire les notes et leurs informations
   */
  const parseMeiToNotes = (meiXML: string): PlaybackEvent[] => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(meiXML, 'text/xml');

    const layers = xmlDoc.querySelectorAll('staff layer');
    const parsedEvents: PlaybackEvent[] = [];

    const processLayerElement = (element: Element, state: { time: number }) => {
      const tagName = element.tagName?.toLowerCase();
      if (!tagName) return;

      if (tagName === 'rest') {
        const restDuration = getElementDuration(element);
        state.time += restDuration.seconds;
        return;
      }

      if (tagName === 'note') {
        const duration = getElementDuration(element);
        const note = createPlaybackNote(element, duration.toneDuration);
        if (note) {
          parsedEvents.push({
            time: state.time,
            notes: [note],
          });
        }
        state.time += duration.seconds;
        return;
      }

      if (tagName === 'chord') {
        const duration = getElementDuration(element);
        const chordNotes = Array.from(element.querySelectorAll('note'))
          .map((note) => createPlaybackNote(note, duration.toneDuration))
          .filter((note): note is PlaybackNote => Boolean(note));

        if (chordNotes.length) {
          parsedEvents.push({
            time: state.time,
            notes: chordNotes,
          });
        }
        state.time += duration.seconds;
        return;
      }

      Array.from(element.children).forEach((child) => processLayerElement(child, state));
    };

    layers.forEach((layer) => {
      const state = { time: 0 };
      Array.from(layer.children).forEach((child) => processLayerElement(child, state));
    });

    return parsedEvents.sort((a, b) => a.time - b.time);
  };

  /**
   * Convertit une durée MEI en durée Tone.js
   */
  const convertMeiDurationToTone = (meiDuration: string, dots: number = 0): string => {
    const durationMap: Record<string, string> = {
      '1': '1n', // whole note
      '2': '2n', // half note
      '4': '4n', // quarter note
      '8': '8n', // eighth note
      '16': '16n', // sixteenth note
      '32': '32n', // thirty-second note
    };

    let toneDuration = durationMap[meiDuration] || '4n';

    if (dots > 0) {
      toneDuration = toneDuration + '.'.repeat(dots);
    }

    return toneDuration;
  };

  const getElementDuration = (element: Element) => {
    const durAttr = element.getAttribute('dur');
    const dotsAttr = element.getAttribute('dots');
    const dots = dotsAttr ? Number(dotsAttr) : 0;
    const toneDuration = convertMeiDurationToTone(durAttr ?? '4', dots);
    return {
      toneDuration,
      seconds: Tone.Time(toneDuration).toSeconds(),
    };
  };

  const createPlaybackNote = (noteEl: Element, toneDuration: string): PlaybackNote | null => {
    const pitch = noteEl.getAttribute('pname');
    const octave = noteEl.getAttribute('oct');
    const id = noteEl.getAttribute('xml:id');

    if (!pitch || !octave) return null;

    const noteId =
      id ||
      (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `note-${Math.random().toString(36).slice(2)}`);

    return {
      pitch: `${pitch.toUpperCase()}${octave}`,
      duration: toneDuration,
      id: noteId,
    };
  };

  /**
   * Lance la lecture de la partition
   */
  const playScore = async (meiXML: string, tempo: number = 120) => {
    if (isPausedAudio.value || isPlayingAudio.value) {
      stopScore();
    }
    try {
      await initializeTone();

      // Parser les notes du MEI
      const parsedNotes = parseMeiToNotes(meiXML);

      if (parsedNotes.length === 0) {
        console.warn('Aucune note trouvée dans le MEI');
        return;
      }

      // Définir le tempo
      Tone.getTransport().bpm.value = tempo;

      const totalDuration = parsedNotes.reduce((max, event) => {
        const noteDurations = event.notes.map((note) => Tone.Time(note.duration).toSeconds());
        const eventDuration = noteDurations.length ? Math.max(...noteDurations) : 0;
        return Math.max(max, event.time + eventDuration);
      }, 0);
      Tone.getTransport().scheduleOnce(() => {
        stopScore();
      }, totalDuration);

      // Créer un Part avec les événements
      part = new Tone.Part((time, event: PlaybackEvent) => {
        if (synth) {
          event.notes.forEach((note) => {
            synth?.triggerAttackRelease(note.pitch, note.duration, time);
          });
        }

        if (highlightCallback) {
          Tone.getDraw().schedule(() => {
            removeHighlightCallback?.();
            const ids = event.notes.map((note) => note.id).filter(Boolean);
            if (ids.length) {
              highlightCallback?.(ids);
            }
          }, time);
        }
      }, parsedNotes);

      // Démarrer la lecture
      part.start();
      Tone.getTransport().start();

      isPlayingAudio.value = true;
      isPausedAudio.value = false;
      isStoppedAudio.value = false;
    } catch (error) {
      console.error('Erreur lors de la lecture:', error);
    }
  };

  /**
   * Met en pause la lecture
   */
  const pauseScore = () => {
    if (Tone.getTransport().state === 'started') {
      Tone.getTransport().pause();
      isPlayingAudio.value = false;
      isPausedAudio.value = true;
      isStoppedAudio.value = false;
    }
  };

  /**
   * Reprend la lecture
   */
  const resumeScore = () => {
    if (Tone.getTransport().state === 'paused') {
      Tone.getTransport().start();
      isPlayingAudio.value = true;
      isPausedAudio.value = false;
      isStoppedAudio.value = false;
    }
  };

  /**
   * Arrête la lecture
   */
  const stopScore = () => {
    if (part) {
      part.stop();
      part.dispose();
      part = null;
    }

    Tone.getTransport().stop();
    Tone.getTransport().cancel();

    if (removeHighlightCallback) {
      removeHighlightCallback();
    }

    isPlayingAudio.value = false;
    isPausedAudio.value = false;
    isStoppedAudio.value = true;
  };

  /**
   * Met à jour le tempo
   */
  const updateTempo = (newTempo: number) => {
    Tone.getTransport().bpm.value = newTempo;
  };

  /**
   * Définit le callback pour surligner les notes
   */
  const setHighlightCallbacks = (highlight: (ids: string[]) => void, removeHighlight: () => void) => {
    highlightCallback = highlight;
    removeHighlightCallback = removeHighlight;
  };

  /**
   * Joue une note spécifique
   */
  const playNote = async (pitch: string, duration: string = '4n') => {
    await initializeTone();
    if (synth) {
      synth.triggerAttackRelease(pitch, duration);
    }
  };

  // Nettoyage lors de la destruction du composant
  onUnmounted(() => {
    stopScore();
    if (synth) {
      synth.dispose();
    }
  });

  return {
    isPlayingAudio,
    isPausedAudio,
    isStoppedAudio,
    playScore,
    pauseScore,
    resumeScore,
    stopScore,
    updateTempo,
    setHighlightCallbacks,
    playNote,
  };
}
