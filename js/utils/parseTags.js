export function parseTags(value) {
  const tags = value
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag !== "");

  return [...new Set(tags)];
}
