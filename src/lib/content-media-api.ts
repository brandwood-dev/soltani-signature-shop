import { apiFetch, publicApiFetch } from "@/lib/api";

export type ContentImagePurpose = "hero" | "brand" | "banner";

export type ResponsiveImageSource = {
  url: string;
  width: number;
};

export type ResponsiveImageSources = {
  webp: ResponsiveImageSource[];
  avif: ResponsiveImageSource[];
};

export type ContentImageUpload = {
  url: string;
  format: "webp";
  width: number;
  height: number;
  bytes: number;
  sources: ResponsiveImageSources;
};

export type SiteMedia = {
  logo: ContentImageUpload | null;
  collections: {
    femme: ContentImageUpload | null;
    homme: ContentImageUpload | null;
    enfant: ContentImageUpload | null;
  };
};

const MAX_CONTENT_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export async function uploadAdminContentImage(file: File, purpose: ContentImagePurpose) {
  if (file.size > MAX_CONTENT_IMAGE_SIZE_BYTES) {
    throw new Error("L'image dépasse la taille maximale autorisée de 5 Mo.");
  }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Lecture du fichier impossible."));
    reader.readAsDataURL(file);
  });

  const [, base64 = ""] = dataUrl.split(",", 2);
  return apiFetch<ContentImageUpload>("/content/admin/images", {
    method: "POST",
    body: JSON.stringify({ fileName: file.name, mimeType: file.type, base64, purpose }),
  });
}

const SITE_MEDIA_CACHE_TTL_MS = 5 * 60 * 1000;
let siteMediaPromise: Promise<SiteMedia> | null = null;
let siteMediaCachedAt = 0;

export function getSiteMedia() {
  if (Date.now() - siteMediaCachedAt >= SITE_MEDIA_CACHE_TTL_MS) {
    siteMediaPromise = null;
  }

  siteMediaPromise ??= publicApiFetch<SiteMedia>("/content/site-media").catch((error) => {
    siteMediaPromise = null;
    siteMediaCachedAt = 0;
    throw error;
  });
  siteMediaCachedAt = Date.now();
  return siteMediaPromise;
}
