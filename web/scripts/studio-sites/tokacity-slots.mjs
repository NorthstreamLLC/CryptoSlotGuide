import tokacity from "./tokacity.mjs";

/**
 * TokaCity's games as the catalogue files some of them: under "Toka City
 * Slots" rather than "Toka City" (see tokacity.mjs, whose list and art this
 * reuses: the card tiles of tokacity.com's own games grid). Titles are still
 * matched exactly within this provider name, so a grid card finds a match
 * here only when the catalogue holds it as a Toka City Slots title.
 */
export default { ...tokacity, studio: "Toka City Slots" };
