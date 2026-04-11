export function parseCourseLabel(name: string) {
  const [maybeCode, ...rest] = name.split(/\s[-–—]\s/);
  if (rest.length > 0 && looksLikeCourseCode(maybeCode)) {
    return {
      code: maybeCode.toUpperCase(),
      title: rest.join(" - "),
    };
  }

  const fallbackCode = name
    .split(/\s+/)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 6)
    .toUpperCase();

  return {
    code: fallbackCode || "COURSE",
    title: name,
  };
}

export function getCourseLabel(folder: { code?: string; name: string }) {
  const parsed = parseCourseLabel(folder.name);
  return {
    code: normalizeCourseCode(folder.code) ?? parsed.code,
    title: parsed.title,
  };
}

export function normalizeCourseCode(value: string | undefined | null) {
  const normalized = value?.trim().toUpperCase();
  return normalized ? normalized : null;
}

function looksLikeCourseCode(value: string) {
  return /^[A-Za-z]{2,}\d{1,}[A-Za-z0-9-]*$/.test(value.replace(/\s+/g, ""));
}
