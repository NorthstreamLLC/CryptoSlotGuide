// Kept apart from lib/derived (which reads the spec sheets) so client code can use it.
export const STALE_READING_DAYS = 30;

export function isStaleReading(checkedAt: string): boolean {
  const checked = new Date(checkedAt).getTime();
  if (Number.isNaN(checked)) return true;
  const ageDays = (Date.now() - checked) / (1000 * 60 * 60 * 24);
  return ageDays > STALE_READING_DAYS;
}
