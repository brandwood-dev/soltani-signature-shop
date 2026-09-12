import type { ImgHTMLAttributes } from "react";
import type { ResponsiveImageSources } from "@/lib/content-media-api";

type Props = ImgHTMLAttributes<HTMLImageElement> & {
  sources?: ResponsiveImageSources;
};

export function ResponsiveImage({ sources, src, alt, ...props }: Props) {
  const avif = sources?.avif?.length ? sources.avif.map((source) => `${source.url} ${source.width}w`).join(", ") : undefined;
  const webp = sources?.webp?.length ? sources.webp.map((source) => `${source.url} ${source.width}w`).join(", ") : undefined;

  return (
    <picture>
      {avif && <source type="image/avif" srcSet={avif} sizes="100vw" />}
      {webp && <source type="image/webp" srcSet={webp} sizes="100vw" />}
      <img src={src} alt={alt} {...props} />
    </picture>
  );
}
