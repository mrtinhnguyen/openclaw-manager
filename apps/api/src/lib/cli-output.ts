export function parseJsonFromCliOutput(raw: string): unknown | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    // fall through
  }
  const lines = trimmed.split(/\r?\n/);
  for (let start = lines.length - 1; start >= 0; start -= 1) {
    const candidate = lines.slice(start).join("\n").trim();
    if (!candidate) continue;
    try {
      return JSON.parse(candidate) as unknown;
    } catch {
      // keep searching
    }
  }
  return null;
}
