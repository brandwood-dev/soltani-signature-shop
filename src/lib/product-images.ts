export type ProductImageSources = {
  w320?: string;
  w640?: string;
  w1024?: string;
};

export function responsiveImageSrcSet(sources?: ProductImageSources) {
  if (!sources) return undefined;
  return [
    sources.w320 ? sources.w320 + " 320w" : "",
    sources.w640 ? sources.w640 + " 640w" : "",
    sources.w1024 ? sources.w1024 + " 1024w" : "",
  ]
    .filter(Boolean)
    .join(", ");
}
