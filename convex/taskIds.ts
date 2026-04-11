export function buildTaskId(...parts: string[]) {
  return parts
    .map((part) => part.trim())
    .filter(Boolean)
    .join(":");
}
