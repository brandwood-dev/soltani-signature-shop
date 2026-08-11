export function getCategoryDisplayName(
  categoryName: string | null | undefined,
  categorySlug: string,
) {
  const canonicalName = categoryName?.trim();
  if (canonicalName) return canonicalName;

  const normalizedSlug = categorySlug
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("fr-FR");

  return normalizedSlug.replace(/^\p{L}/u, (letter) => letter.toLocaleUpperCase("fr-FR"));
}
