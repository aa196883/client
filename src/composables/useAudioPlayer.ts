import { ref, onUnmounted } from 'vue';
import * as Tone from 'tone';

interface ParsedNote {
  pitch: string;
  duration: string;
  time: number;
  id: string;
}

type ParsedTrack = ParsedNote[];

/**
 * Composable pour la gestion de la lecture audio avec Tone.js
 */
export function useAudioPlayer() {
  const isPlayingAudio = ref(false);
  const isPausedAudio = ref(false);
  const isStoppedAudio = ref(true);
  let highlightCallback: ((id: string) => void) | null = null;
  let removeHighlightCallback: (() => void) | null = null;

  let synth: Tone.PolySynth<Tone.Synth> | null = null;
  let parts: Tone.Part[] = [];
  let lastHighlightTime: number | null = null;

  /**
   * Initialise Tone.js et crée un synthétiseur
   */
  const initializeTone = async () => {
    if (Tone.getContext().state !== 'running') {
      await Tone.start();
    }

    if (!synth) {
      synth = new Tone.PolySynth(Tone.Synth).toDestination();
    }
  };

  /**
   * Parse le MEI XML pour extraire les notes et leurs informations
   */
  const parseMeiToTracks = (meiXML: string): ParsedTrack[] => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(meiXML, 'text/xml');

    const staffElements = Array.from(xmlDoc.querySelectorAll('staff'));
    const parsedTracks: ParsedTrack[] = [];

    staffElements.forEach((staffEl, staffIndex) => {
      const parsedNotes: ParsedNote[] = [];
      let currentTime = 0;

      staffEl.querySelectorAll('note').forEach((noteEl, noteIndex) => {
        const pitch = noteEl.getAttribute('pname');
        const octave = noteEl.getAttribute('oct');
        const duration = noteEl.getAttribute('dur') || '4';
        const id = noteEl.getAttribute('xml:id');

        if (pitch && octave) {
          const tonePitch = `${pitch.toUpperCase()}${octave}`;
          const toneDuration = convertMeiDurationToTone(duration);
          parsedNotes.push({
            pitch: tonePitch,
            duration: toneDuration,
            time: currentTime,
            id: id || `staff-${staffIndex + 1}-note-${noteIndex}`,
          });

          currentTime += Tone.Time(toneDuration).toSeconds();
        }
      });

      if (parsedNotes.length > 0) {
        parsedTracks.push(parsedNotes);
      }
    });

    return parsedTracks;
  };

  /**
   * Convertit une durée MEI en durée Tone.js
   */
  const convertMeiDurationToTone = (meiDuration: string): string => {
    const durationMap: Record<string, string> = {
      '1': '1n', // whole note
      '2': '2n', // half note
      '4': '4n', // quarter note
      '8': '8n', // eighth note
      '16': '16n', // sixteenth note
      '32': '32n', // thirty-second note
    };

    return durationMap[meiDuration] || '4n';
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
      const parsedTracks = parseMeiToTracks(meiXML);

      if (parsedTracks.length === 0) {
        console.warn('Aucune note trouvée dans le MEI');
        return;
      }

      // Définir le tempo avant de créer les événements
      Tone.getTransport().bpm.value = tempo;

      // Créer les événements pour chaque voix (piste)
      const tracksEvents: Array<Array<{ time: number; note: ParsedNote }>> = parsedTracks.map(
        (track) =>
          track.map((note) => ({
            time: note.time,
            note,
          })),
      );

      // Arrêter automatiquement à la fin (durée maximale parmi les pistes)
      const totalDuration = parsedTracks.reduce((maxDuration, track) => {
        if (track.length === 0) return maxDuration;
        const lastNote = track[track.length - 1];
        const trackDuration = lastNote.time + Tone.Time(lastNote.duration).toSeconds();
        return Math.max(maxDuration, trackDuration);
      }, 0);

      Tone.getTransport().scheduleOnce(() => {
        stopScore();
      }, totalDuration);

      // Créer un Part pour chaque piste
      parts = tracksEvents.map((events) =>
        new Tone.Part((time, event) => {
          if (synth) {
            synth.triggerAttackRelease(event.note.pitch, event.note.duration, time);
          }

          if (highlightCallback) {
            Tone.getDraw().schedule(() => {
              if (lastHighlightTime !== time) {
                removeHighlightCallback?.();
                lastHighlightTime = time;
              }
              highlightCallback?.(event.note.id);
            }, time);
          }
        }, events),
      );

      // Démarrer la lecture
      parts.forEach((trackPart) => trackPart.start());
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
    parts.forEach((part) => {
      part.stop();
      part.dispose();
    });
    parts = [];

    lastHighlightTime = null;

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
  const setHighlightCallbacks = (highlight: (id: string) => void, removeHighlight: () => void) => {
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
