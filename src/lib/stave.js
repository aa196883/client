/**
 * @file Defines a class to represent the stave using vexflow.
 *
 * @module stave
 */

//====== Imports ======//
import { Renderer, Stave, Formatter, StaveNote, Accidental, Dot } from 'vexflow';

/**
 * Class defining the vexflow stave used to display the notes from the piano
 */
class StaveRepresentation {
  /** Array containing the notes */
  melody; // type: {StaveNote[]}

  #width;
  #height;
  #init_pentagram_width = 450;

  #html_elem;
  #stave; // type: {Stave}
  #renderer;
  #context;

  static #instance = null;

  /**
   * Construct the class
   *
   * @param {number} [width=450] - the width of the representation of the stave
   * @param {number} [height=200] - the height of the representation of the stave
   */
  constructor(width = 450, height = 200) {
    this.melody = [];

    this.#width = width;
    this.#height = height;
  }

  /**
   * Returns the instance of the stave representation.
   * If it does not exist, creates a new one.
   * @param {number} [width=450] - the width of the representation of the stave
   * @param {number} [height=200] - the height of the representation of
   *
   * @returns {StaveRepresentation} - the instance of the stave representation.
   */
  static getInstance(width = 450, height = 200) {
    if (this.#instance === null) {
      this.#instance = new StaveRepresentation(width, height);
    }
    return this.#instance;
  }

  /**
   * Initiates the HTML (vexflow).
   * Also connects the buttons.
   *
   * @param {Player} player - the player associated to this stave
   * @param {HTMLElement} playBt - the HTML button used to play / stop the melody. Here it is used to connect
   * @param {HTMLElement} clearAllButton - the HTML button used to clear all the stave
   * @param {HTMLElement} clearLastNoteButton - the HTML button used to clear the last note from the stave
   */
  init() {
    this.#html_elem = document.getElementById('music-score');
    if (!this.#html_elem) {
      console.error("Error: HTML element with id 'music-score' not found.");
      return;
    }

    // Create an SVG renderer and attach it to the pentagram
    this.#renderer = new Renderer(this.#html_elem, Renderer.Backends.SVG);

    // Configure the rendering context
    this.#renderer.resize(this.#width, this.#height);
    this.#context = this.#renderer.getContext();
    this.#context.setFont('Arial', 10);

    // Finally create the stave with the treble symbol and draw it
    this.#stave = new Stave(10, 40, this.#width);
    this.#stave.addClef('treble');
    this.#stave.setContext(this.#context).draw();

    this.resizeStave();
  }

  /**
   * Resizes the stave width, according to the notes in the melody.
   * Ensures that the minimal width is respected (`init_pentagram_width`).
   */
  resizeStave() {
    let totalWidth = 0;
    this.melody.forEach((note) => {
      totalWidth += note.getWidth() + 5;
    });

    totalWidth = Math.max(totalWidth, this.#init_pentagram_width);

    // If the new width is greater or smaller than the initial width, update stave width and pentagran_width variable
    if (totalWidth > this.#width || totalWidth < this.#width) {
      this.#stave.setWidth(totalWidth + 100);
      this.#renderer.resize(totalWidth + 100, this.#height);
      this.#width = totalWidth;
    }

    // Cancel the previous pentagram
    const svg = document.querySelector('#music-score svg');
    svg.replaceChildren();
    this.#stave.setContext(this.#context).draw();

    // Re-draw it
    this.melody.forEach((note) => {
      note.setContext(this.#context).draw();
    });
  }

  /**
   * Displays the note to the stave and add it to `melody`.
   *
   * @param {string} note - the note name (e.g C/5, C#/4, with the '/') ;
   * @param {string[]} keys - array of keys ;
   * @param {string} duration - the note duration (w, h, q, 8, 16, 32, hd, qd, 8d, 16d, 32d).
   */
  displayNote(note, keys, duration, dots = 0) {
    let display_note;
    if (note == 'r') {
      display_note = new StaveNote({
        keys: ['B/4'], // just for middle height
        type: 'r', // rest
        duration: duration,
      });
    } else {
      display_note = new StaveNote({
        keys: keys,
        duration: duration,
        clef: 'treble',
        auto_stem: true,
      });
    }

    if (note.includes('#')) display_note.addModifier(new Accidental('#'), 0);

    if (dots > 0) {
      for (let i = 0; i < dots; i += 1) {
        Dot.buildAndAttach([display_note], { all: true });
      }
    }

    this.melody.push(display_note);

    // Format stave and all notes
    Formatter.FormatAndDraw(this.#context, this.#stave, this.melody);

    this.resizeStave();
  }

  /**
   * Changes the last note on the stave for one with the same pitch, but with a different rhythm.
   *
   * @param {*} newRhythm - the new wanted rhythm.
   */
  changeLastNoteRhythm(newRhythm) {
    // If there is no note to modify, abort
    if (this.melody.length == 0) return;

    // Remove last note
    let last_note = this.melody.slice(-1)[0];
    let note = last_note.keys[0];
    if (last_note.noteType == 'r') note = 'r';

    this.remove_last_note();

    // Add the note with the new rhythm
    this.displayNote(note, last_note.keys, newRhythm);
  }

  /**
   * Remove from the melody array all the inserted note and clear the stave as well
   */
  clear_all_pattern() {
    this.melody = [];

    // Cancel the previous pentagram
    let pentagram_svg = document.querySelector('#music-score svg');
    while (pentagram_svg.firstChild) {
      pentagram_svg.removeChild(pentagram_svg.firstChild);
    }
    this.#stave.setContext(this.#context).draw();

    this.resizeStave();
  }

  /**
   * Remove from the melody array the last inserted note and re-draw the pentagram
   */
  remove_last_note() {
    this.melody.pop();

    // Cancel the previous pentagram
    let pentagram_svg = document.querySelector('#music-score svg');
    while (pentagram_svg.firstChild) {
      pentagram_svg.removeChild(pentagram_svg.firstChild);
    }
    this.#stave.setContext(this.#context).draw();

    // Re-draw the pentagram
    this.melody.forEach((note) => {
      note.setContext(this.#context).draw();
    });

    this.resizeStave();
  }

  serializeMelody() {
    return this.melody.map((note) => ({
      keys: [...note.keys],
      duration: note.duration,
      dots: note.dots || 0,
      noteType: note.noteType ?? null,
    }));
  }

  loadSerializedMelody(serializedMelody) {
    this.clear_all_pattern();

    serializedMelody.forEach((noteData) => {
      const dotCount = noteData.dots || 0;
      const duration = noteData.duration;
      const noteKeys = noteData.keys && noteData.keys.length ? noteData.keys : ['B/4'];
      const noteLabel = noteData.noteType === 'r' ? 'r' : noteKeys[0] ?? 'r';

      this.displayNote(noteLabel, noteKeys, duration, dotCount);
    });
  }
}

export default StaveRepresentation;
