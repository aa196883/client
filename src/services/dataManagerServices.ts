import { durationNote } from '@/constants/index.ts';
import { nextTick } from 'vue';
import {
  applyColorToNote,
  getAllScoreNotes,
  getMatchNotes,
  getNoteColor,
  getScoreMatches,
  type MatchCarrier,
} from '@/services/resultProcessingService';

/**
 * Return the sub-array corresponding to the data from page `pageNb`.
 *
 * @param {*} data - the page data ;
 * @param {number} pageNb - the number of the page to get
 * @param {number} numberPerPage - the number of items per page. '*' for all.
 *
 * @return {json[]} data for the page `pageNb`.
 */
export function getPageN(data: any[], pageNb: number, numberPerPage: number) {
  return data.slice((pageNb - 1) * numberPerPage, pageNb * numberPerPage);
}

function getScoreContainer(score: MatchCarrier): HTMLElement | null {
  if (!score || !score.source) return null;
  return document.getElementById(score.source);
}
export function colorMatches(score: MatchCarrier = { matches: [] }) {
  // color the matches
  nextTick().then(() => {
    if (!score) return;

    const matches = getScoreMatches(score);
    const scoreRoot = getScoreContainer(score) ?? document;
    if (!scoreRoot) return;
    if (matches.length) {
      for (let match_nb = matches.length - 1; match_nb >= 0; --match_nb) {
        // Reverse order to get the best color in last 'layer'
        const notes = getMatchNotes(matches[match_nb]);
        notes.forEach((note) => {
          const col = getNoteColor(note);
          applyColorToNote(note, col, scoreRoot);
        });
      }
      return;
    }

    const standaloneNotes = getAllScoreNotes(score);
    standaloneNotes.forEach((note) => {
      const col = getNoteColor(note);
      applyColorToNote(note, col, scoreRoot);
    });
  });
}

/**
 * Create the `notes` for the python script
 * @param {Array<StaveNote>} melody - the melody to convert to a query parameter ;
 * @param {boolean} ignore_pitch - if true, the pitch of the notes is ignored ;
 * @param {boolean} ignore_rhythm - if true, the rhythm of the notes is ignored ;
 *
 * @return {string} the notes query parameter, ready to be used in the python script.
 */
export function createNotesQueryParam(melody: any, ignore_pitch: boolean, ignore_rhythm: boolean) {
  let notes = '[';
  for (let k = 0; k < melody.length; ++k) {
    notes += '([';

    //---Add pitch (class + octave)
    for (let note_idx = 0; note_idx < melody[k].keys.length; ++note_idx) {
      const note = melody[k].keys[note_idx];

      //---Add note class ('a', 'gs', ...)
      if (ignore_pitch) notes += 'None, ';
      else if ((melody[k] as any).noteType == 'r')
        // rest
        notes += "'r', ";
      else notes += `'${note}', `;
    }
    notes = notes.slice(0, -2) + '], '; // Remove trailing ', '

    //---Add duration
    if (ignore_rhythm) notes += 'None, None), ';
    else {
      const dur = 1 / durationNote[melody[k].duration];
      const dots = melody[k].dots || 0;

      notes += `${dur}, ${dots}), `;
    }
  }

  notes = notes.slice(0, -2) + ']'; // Remove trailing ', ' and add ']'.

  return notes;
}

export function extractTitleFromMeiXML(meiXML: string, fileName?: string): string {
  const meiFileName = fileName?.replace(/\.mei$/i, '');

  // Try to extract the title from the <pgHead> tag
  return (
    meiXML
      .match(/<pgHead.*?<\/pgHead>/s)?.[0]
      ?.match(/<rend.*?<\/rend>/s)?.[0]
      ?.match(/>.*?</s)?.[0]
      .slice?.(1, -1) ?? // if no pgHead found, try to get title from <title> tag
    meiXML
      .match(/<title>.*?<\/title>/s)?.[0]
      .match(/>.*?</s)?.[0]
      .slice?.(1, -1) ?? // if no title found, try to use the file name
    meiFileName ?? // if no file name, return a default value
    'Titre inconnu'
  );
}

export function extractAuthorFromMeiXML(meiXML: string): string {
  // Try to extract the author from the <pgHead> tag
  return (
    meiXML
      .match(/<pgHead.*?>.*?<\/pgHead>/s)?.[0]
      ?.match(/<rend.*?>.*?<\/rend>/gs)?.[1]
      ?.match(/>.*?</s)?.[0]
      .slice?.(1, -1) ?? // if no pgHead found, try to get author from <author> tag
    meiXML
      .match(/<author>.*?<\/author>/s)?.[0]
      .match(/>.*?</s)?.[0]
      .slice?.(1, -1) ?? // if no author found, return a default value
    ''
  );
}

export function extractCommentFromMeiXML(meiXML: string): string {
  // Try to extract the comment from the <pgHead> tag
  return (
    meiXML
      .match(/<pgHead.*?<\/pgHead>/s)?.[0]
      ?.match(/<rend.*?<\/rend>/gs)?.[2]
      ?.match(/>.*?</s)?.[0]
      .slice?.(1, -1) ?? // if no pgHead found, try to get author from <author> tag
    meiXML
      .match(/<author>.*?<\/author>/s)?.[0]
      .match(/>.*?</s)?.[0]
      .slice?.(1, -1) ?? // if no author found, return a default value
    ''
  );
}

/**
 * Extract the title, author and comment from the MEI file
 * it avoid text overlapping when the title, author and comment are too long.
 * @param {string} meiXML - the MEI file content
 * @param {string} [fileName] - the MEI file name for fallback purposes
 * @returns {object} the title, author and comment
 */
export function extractTitleAuthorComment(meiXML: string, fileName?: string): {title: string, author: string, comment: string} {
    // extract title, author and comment
    const title = extractTitleFromMeiXML(meiXML, fileName);
    const author = extractAuthorFromMeiXML(meiXML);
    const comment = extractCommentFromMeiXML(meiXML);

    return {
        title,
        author,
        comment
    };
}

/**
 * Remove the <pgHead> section from the MEI file that is overlapping
 * @param {string} meiXML - the MEI file content
 * @returns {string} the MEI file content without the <pgHead> section
 */
export function removePgHead(meiXML: string): string {
  return meiXML.replace(/<pgHead.*?<\/pgHead>/s, '');
}