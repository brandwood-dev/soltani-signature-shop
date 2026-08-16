import { describe, expect, test } from "bun:test";
import type { HomeData, HomeDataLoaders } from "./home-data";
import { loadHomeData, recoverHomeData } from "./home-data";

const product = {
  id: "product-1",
  slug: "product-1",
  name: "Produit test",
  brand: "Marque",
  category: "Test",
  price: 100,
  image: "/product.webp",
};

function loaders(overrides: Partial<HomeDataLoaders> = {}): HomeDataLoaders {
  return {
    heroSlides: async () => [],
    bestsellers: async () => [product],
    newArrivals: async () => [product],
    packs: async () => [],
    promoBanners: async () => [],
    limitedOffers: async () => [],
    ...overrides,
  };
}

describe("home data resilience", () => {
  test("distinguishes an API failure from a legitimate empty section", async () => {
    const data = await loadHomeData(
      loaders({ bestsellers: async () => Promise.reject(new Error("backend sleeping")) }),
    );

    expect(data.bestsellers).toEqual([]);
    expect(data.packs).toEqual([]);
    expect(data.failedSections).toEqual(["bestsellers"]);
  });

  test("recovers failed products without discarding successful data", async () => {
    const initial: HomeData = {
      heroSlides: [],
      bestsellers: [],
      newArrivals: [product],
      packs: [],
      promoBanners: [],
      limitedOffer: null,
      failedSections: ["bestsellers"],
    };
    let calls = 0;
    const progress: HomeData[] = [];

    const recovered = await recoverHomeData(initial, {
      attempts: 3,
      delayMs: 0,
      sleep: async () => undefined,
      onProgress: (data) => progress.push(data),
      load: async () => {
        calls += 1;
        return {
          ...initial,
          bestsellers: calls === 1 ? [] : [product],
          newArrivals: [],
          failedSections: calls === 1 ? ["bestsellers", "newArrivals"] : ["newArrivals"],
        };
      },
    });

    expect(calls).toBe(3);
    expect(progress[1]?.bestsellers).toEqual([product]);
    expect(recovered.bestsellers).toEqual([product]);
    expect(recovered.newArrivals).toEqual([product]);
    expect(recovered.failedSections).toEqual(["newArrivals"]);
  });
});
