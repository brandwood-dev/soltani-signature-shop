import type { Product } from "@/components/site/ProductCard";
import { getCatalogProducts } from "@/lib/catalog-api";
import { getActiveHeroSlides, type HeroSlide } from "@/lib/hero-api";
import {
  getActivePromoBanners,
  type PromoBanner as PromoBannerItem,
} from "@/lib/promo-banners-api";

export type HomeSection =
  | "heroSlides"
  | "bestsellers"
  | "newArrivals"
  | "packs"
  | "promoBanners"
  | "limitedOffer";

export type HomeData = {
  heroSlides: HeroSlide[];
  bestsellers: Product[];
  newArrivals: Product[];
  packs: Product[];
  promoBanners: PromoBannerItem[];
  limitedOffer: PromoBannerItem | null;
  failedSections: HomeSection[];
};

export type HomeDataLoaders = {
  heroSlides: () => Promise<HeroSlide[]>;
  bestsellers: () => Promise<Product[]>;
  newArrivals: () => Promise<Product[]>;
  packs: () => Promise<Product[]>;
  promoBanners: () => Promise<PromoBannerItem[]>;
  limitedOffers: () => Promise<PromoBannerItem[]>;
};

type SectionResult<T> = {
  section: HomeSection;
  value: T;
  failed: boolean;
};

const defaultLoaders: HomeDataLoaders = {
  heroSlides: getActiveHeroSlides,
  bestsellers: () => getCatalogProducts({ bestSeller: true, limit: 8, summary: true }),
  newArrivals: () => getCatalogProducts({ featured: true, limit: 8, summary: true }),
  packs: () => getCatalogProducts({ category: "coffrets-parfum" }),
  promoBanners: () => getActivePromoBanners("home", "promotion"),
  limitedOffers: () => getActivePromoBanners("home", "limited_offer"),
};

async function loadSection<T>(
  section: HomeSection,
  load: () => Promise<T>,
  fallback: T,
): Promise<SectionResult<T>> {
  try {
    return { section, value: await load(), failed: false };
  } catch {
    return { section, value: fallback, failed: true };
  }
}

export async function loadHomeData(loaders: HomeDataLoaders = defaultLoaders): Promise<HomeData> {
  const [heroSlides, bestsellers, newArrivals, packs, promoBanners, limitedOffers] =
    await Promise.all([
      loadSection("heroSlides", loaders.heroSlides, []),
      loadSection("bestsellers", loaders.bestsellers, []),
      loadSection("newArrivals", loaders.newArrivals, []),
      loadSection("packs", loaders.packs, []),
      loadSection("promoBanners", loaders.promoBanners, []),
      loadSection("limitedOffer", loaders.limitedOffers, []),
    ]);

  const results = [heroSlides, bestsellers, newArrivals, packs, promoBanners, limitedOffers];
  const failedSections = results.filter((result) => result.failed).map((result) => result.section);

  if (failedSections.length > 0) {
    console.warn({ event: "home_data_partial_failure", sections: failedSections });
  }

  return {
    heroSlides: heroSlides.value,
    bestsellers: bestsellers.value,
    newArrivals: newArrivals.value,
    packs: packs.value,
    promoBanners: promoBanners.value,
    limitedOffer: limitedOffers.value[0] ?? null,
    failedSections,
  };
}

export function mergeHomeData(previous: HomeData, next: HomeData): HomeData {
  const failed = new Set(next.failedSections);
  const unresolved = previous.failedSections.filter((section) => failed.has(section));
  return {
    heroSlides: failed.has("heroSlides") ? previous.heroSlides : next.heroSlides,
    bestsellers: failed.has("bestsellers") ? previous.bestsellers : next.bestsellers,
    newArrivals: failed.has("newArrivals") ? previous.newArrivals : next.newArrivals,
    packs: failed.has("packs") ? previous.packs : next.packs,
    promoBanners: failed.has("promoBanners") ? previous.promoBanners : next.promoBanners,
    limitedOffer: failed.has("limitedOffer") ? previous.limitedOffer : next.limitedOffer,
    failedSections: unresolved,
  };
}

export async function recoverHomeData(
  initial: HomeData,
  options: {
    attempts?: number;
    delayMs?: number;
    load?: () => Promise<HomeData>;
    sleep?: (delayMs: number) => Promise<void>;
    onProgress?: (data: HomeData) => void;
  } = {},
) {
  const attempts = options.attempts ?? 3;
  const delayMs = options.delayMs ?? 1_500;
  const load = options.load ?? loadHomeData;
  const sleep =
    options.sleep ??
    ((delay: number) => new Promise<void>((resolve) => globalThis.setTimeout(resolve, delay)));
  let current = initial;

  for (let attempt = 0; attempt < attempts && current.failedSections.length > 0; attempt += 1) {
    if (attempt > 0) {
      await sleep(delayMs * attempt);
    }
    current = mergeHomeData(current, await load());
    options.onProgress?.(current);
  }

  return current;
}
