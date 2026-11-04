/** Types for the legal data, kept apart so small modules can import them without the data. */
export interface Source {
  label: string;
  url: string;
}

export interface USState {
  code: string;
  name: string;
  onlineCasino: string;
  sportsBetting: string;
  sweepstakes: string;
  /** Whether a sweepstakes ban comes from a law or regulator action, with the bill or chapter and date. */
  sweepstakesDetail?: string;
  pokerOnline?: string;
  minAge?: string;
  regulator?: { name: string; url: string };
  licensedOnlineCasinos?: string[];
  licensedListUrl?: string;
  note?: string;
  sources: Source[];
}

export interface Country {
  code: string;
  name: string;
  onlineCasino: string;
  sportsBetting: string;
  regulator?: { name: string; url: string } | null;
  minAge?: string;
  crypto?: string;
  licensing?: string;
  note?: string;
  sources: Source[];
}

export interface Shape {
  code: string | null;
  name: string;
  d: string;
  c?: number[];
}
