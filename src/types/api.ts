export type Note = {
  note?: any;
  note_deg: number;
  pitch_deg: number;
  duration_deg: number;
  sequencing_deg: number;
  id: string;
};

export type PolyphonicVoice = {
  voice_index: number;
  start: number;
  end: number;
  voice_degree: number;
  notes: Note[];
};

export type Match = {
  overall_degree: number;
  notes?: Note[];
  voices?: PolyphonicVoice[];
};

export type DataResults = {
  source: string;
  number_of_occurrences?: number;
  max_match_degree?: number;
  overall_degree?: number;
  matches?: Match[];
  voices?: PolyphonicVoice[];
};
