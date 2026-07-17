/** Parses a comma-separated CORS_ORIGINS env value into an origin list for enableCors(). */
export function parseListOfAllowedOrigins(raw: string | undefined): string[] {
  return (raw ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}
