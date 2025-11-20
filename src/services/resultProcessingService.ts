import { getGradientColor } from '@/services/colorService';
import type { DataResults, Match, Note, PolyphonicVoice } from '@/types/api';

export type MatchCarrier = {
  matches?: Match[];
  voices?: PolyphonicVoice[];
  overall_degree?: number;
  source?: string;
};

export const normalizeNotes = (notes: Note[] = []): Note[] =>
  notes
    .map((note) => {
      if (note.id) return note;
      if (note.note?.id) {
        return {
          ...note,
          id: note.note.id,
        } as Note;
      }
      return note;
    })
    .filter((note): note is Note => Boolean(note.id));

const flattenVoiceNotes = (voices: PolyphonicVoice[] = []): Note[] =>
  voices.flatMap((voice) => normalizeNotes(voice.notes ?? []));

export const getMatchNotes = (match?: Match): Note[] => {
  if (!match) return [];

  if (Array.isArray(match.notes) && match.notes.length) {
    return normalizeNotes(match.notes);
  }

  if (Array.isArray(match.voices) && match.voices.length) {
    return flattenVoiceNotes(match.voices);
  }

  return [];
};

export const getScoreMatches = (score?: MatchCarrier): Match[] => {
  if (!score) return [];

  if (Array.isArray(score.matches) && score.matches.length) {
    return score.matches;
  }

  if (Array.isArray(score.voices) && score.voices.length) {
    return [
      {
        overall_degree: score.overall_degree ?? score.voices[0]?.voice_degree ?? 0,
        voices: score.voices,
        notes: flattenVoiceNotes(score.voices),
      },
    ];
  }

  return [];
};

export const getAllScoreNotes = (score?: MatchCarrier): Note[] =>
  getScoreMatches(score).flatMap((match) => getMatchNotes(match));

const normalizeResultMatches = (result: DataResults): Match[] => {
  if (Array.isArray(result.matches) && result.matches.length) {
    return result.matches;
  }

  if (Array.isArray(result.voices) && result.voices.length) {
    return [
      {
        overall_degree: result.overall_degree ?? result.max_match_degree ?? 0,
        voices: result.voices,
        notes: flattenVoiceNotes(result.voices),
      },
    ];
  }

  return [];
};

const getMaxMatchDegree = (matches: Match[], currentMax: number | undefined): number => {
  const matchMax = matches.reduce((max, match) => Math.max(max, match.overall_degree ?? 0), 0);
  return Math.max(matchMax, currentMax ?? 0);
};

export const mergeResultsBySource = (results: DataResults[] = []): DataResults[] => {
  const mergedResults: Record<string, DataResults> = {};

  results.forEach((result) => {
    if (!result.source) return;

    const normalizedMatches = normalizeResultMatches(result);
    const existingResult = mergedResults[result.source];

    if (!existingResult) {
      mergedResults[result.source] = {
        ...result,
        matches: normalizedMatches,
        number_of_occurrences: normalizedMatches.length || result.number_of_occurrences || 0,
        max_match_degree: getMaxMatchDegree(normalizedMatches, result.max_match_degree),
      };
      return;
    }

    const mergedMatches = [...(existingResult.matches ?? []), ...normalizedMatches];
    mergedResults[result.source] = {
      ...existingResult,
      matches: mergedMatches,
      number_of_occurrences: mergedMatches.length || existingResult.number_of_occurrences || 0,
      max_match_degree: getMaxMatchDegree(mergedMatches, existingResult.max_match_degree),
    };
  });

  return Object.values(mergedResults);
};

export const getNoteColor = (note: { note_deg?: number }): string => {
  const degree = typeof note.note_deg === 'number' ? note.note_deg : 0;
  return getGradientColor(degree);
};

function escapeCssId(id: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(id);
  }
  return id.replace(/([\0-\x1F\x7F!"#$%&'()*+,./:;<=>?@\[\\\]^`{|}~])/g, '\\$1');
}

export const applyColorToNote = (
  note: Note,
  color: string,
  root?: Document | HTMLElement | null,
): void => {
  if (!note.id || !root) return;

  const escapedId = escapeCssId(note.id);
  const noteheadElements = root.querySelectorAll<SVGElement>(`#${escapedId} .notehead`);

  if (noteheadElements.length) {
    noteheadElements.forEach((element) => element.setAttribute('fill', color));
    return;
  }

  const noteElement = root.querySelector<SVGElement>(`#${escapedId}`);
  if (noteElement) {
    noteElement.setAttribute('fill', color);
  }
};
