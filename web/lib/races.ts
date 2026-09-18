/**
 * Each casino's recurring races and raffles, and official partners, in short
 * display form. Every entry summarises a cited fact in data/casinoSpecSheets.json
 * ("Bonus terms" Leaderboards / Weekly raffle / Prize draws, and "Compliance" Partners);
 * the full wording and source link sit on the casino's report.
 */

export interface Race {
  /** Short label, e.g. "$100K weekly raffle". */
  label: string;
  /** Rough prize money a month (daily x30, weekly x4.3), used only for sorting. */
  monthly: number;
  kind: "race" | "raffle" | "draw" | "tournament";
}

const RACES: Record<string, Race> = {
  duel: { label: "$3M monthly + $25K daily races", monthly: 3_750_000, kind: "race" },
  stake: { label: "$100K daily race + weekly raffle", monthly: 3_000_000, kind: "race" },
  gamdom: { label: "$500K bi-weekly + $30K daily races", monthly: 1_900_000, kind: "race" },
  rainbet: { label: "$100K weekly + $25K daily races", monthly: 1_180_000, kind: "race" },
  winna: { label: "$50K weekly + $10K daily races", monthly: 515_000, kind: "race" },
  "bc-game": { label: "$20K weekly raffle + daily wager contest", monthly: 86_000, kind: "raffle" },
  roobet: { label: "$100K weekly raffle", monthly: 430_000, kind: "raffle" },
  shuffle: { label: "$100K weekly race", monthly: 430_000, kind: "race" },
  duelbits: { label: "$30K weekly + $10K daily races", monthly: 430_000, kind: "race" },
  thrill: { label: "$75K weekly race", monthly: 322_000, kind: "race" },
  "500-casino": { label: "$250K monthly Royale", monthly: 250_000, kind: "race" },
  betfury: { label: "$20K daily Battles", monthly: 600_000, kind: "race" },
  metawin: { label: "$250K monthly prize draw", monthly: 250_000, kind: "draw" },
  yeet: { label: "$50K weekly Chairman's Cup", monthly: 215_000, kind: "race" },
  goated: { label: "$25K weekly + $2.5K daily races", monthly: 182_000, kind: "race" },
  dicey: { label: "$35K weekly race", monthly: 150_000, kind: "race" },
  solcasino: { label: "$25K weekly race + $10K raffle", monthly: 150_000, kind: "race" },
  razed: { label: "$100K monthly + $10K weekly races", monthly: 143_000, kind: "race" },
  shock: { label: "$50K monthly + $10K weekly races", monthly: 123_000, kind: "race" },
  rollbit: { label: "$25K daily race + $25K weekly sports race", monthly: 857_000, kind: "race" },
  degen: { label: "$25K weekly race", monthly: 107_000, kind: "race" },
  toshibet: { label: "$25K weekly raffle", monthly: 107_000, kind: "raffle" },
  qzino: { label: "$20K weekly race", monthly: 86_000, kind: "race" },
  "bitcasino-io": { label: "54,000 USDT slot challenges", monthly: 54_000, kind: "tournament" },
  "sportsbet-io": { label: "54,000 USDT slot challenges", monthly: 54_000, kind: "tournament" },
  acebet: { label: "$15K monthly + $1K daily races", monthly: 45_000, kind: "race" },
  gamba: { label: "Weekly lottery from $10K", monthly: 43_000, kind: "draw" },
  jackpotbet: { label: "$10K+ weekly race", monthly: 43_000, kind: "race" },
  flush: { label: "$10K weekly race", monthly: 43_000, kind: "race" },
  "1win": { label: "$10K monthly + $5K weekly tournaments", monthly: 31_000, kind: "tournament" },
  vave: { label: "15,000 USDT monthly slot race", monthly: 30_000, kind: "race" },
  "7bit": { label: "$1,500 weekly Lucky Spin + free-spin tournaments", monthly: 6_500, kind: "tournament" },
  bitstarz: { label: "€5K weekly Slot Wars", monthly: 21_000, kind: "tournament" },
  betplay: { label: "$2K weekly raffle + $1K race", monthly: 13_000, kind: "raffle" },
  fortunejack: { label: "Up to $2,500 weekly", monthly: 10_000, kind: "tournament" },
};

const PARTNERS: Record<string, string> = {
  stake: "Drake, UFC & Everton FC",
  roobet: "Chelsea FC & 6 more",
  "bc-game": "Leicester City FC, Jason Derulo & more",
  cloudbet: "PFL, Karate Combat & Tom Aspinall",
  shuffle: "Sunderland AFC",
  rollbit: "FaZe Clan",
  duelbits: "Team Liquid, Michael Bisping & 2 more",
  "sportsbet-io": "Tottenham Hotspur & Aston Villa",
  rainbet: "BKFC & 5 more",
  spartans: "Conor Benn & 2 more",
  "1win": "Luis Suárez & Jon Jones",
  vave: "Judd Trump",
};

export const raceFor = (slug: string): Race | null => RACES[slug] ?? null;
export const partnerFor = (slug: string): string | null => PARTNERS[slug] ?? null;
export const raceSlugs = () => Object.entries(RACES).sort((a, b) => b[1].monthly - a[1].monthly).map(([s]) => s);
