export type GallerySelection = {
  axisKey: string;
  value: string;
};

export type GalleryVariant = {
  id: string;
  label: string;
  imageUrl?: string;
  stockQuantity: number;
  isActive: boolean;
  sortOrder: number;
  selections?: GallerySelection[];
};

export type GalleryAxis = {
  key: string;
  label: string;
  sortOrder: number;
  values: Array<{
    value: string;
    label: string;
    imageUrl?: string;
    sortOrder: number;
  }>;
};

export type ProductGalleryItem = {
  url: string;
  alt: string;
  label?: string;
  source: "product" | "variant" | "option";
  available: boolean;
  associations: Array<{
    variantId?: string;
    selections: Record<string, string>;
    available: boolean;
  }>;
};

type ProductGalleryInput = {
  name: string;
  image: string;
  gallery?: string[];
  variants?: GalleryVariant[];
  variantAxes?: GalleryAxis[];
};

export function buildUnifiedProductGallery(product: ProductGalleryInput): ProductGalleryItem[] {
  const items: ProductGalleryItem[] = [];
  const byUrl = new Map<string, ProductGalleryItem>();

  const add = (
    rawUrl: string | undefined,
    item: Omit<ProductGalleryItem, "url" | "associations">,
    association?: ProductGalleryItem["associations"][number],
  ) => {
    const url = rawUrl?.trim();
    if (!url) return;

    const existing = byUrl.get(url);
    if (existing) {
      existing.available ||= item.available;
      existing.label ??= item.label;
      if (
        association &&
        !existing.associations.some(
          (current) =>
            current.variantId === association.variantId &&
            JSON.stringify(current.selections) === JSON.stringify(association.selections),
        )
      ) {
        existing.associations.push(association);
      }
      return;
    }

    const created: ProductGalleryItem = {
      ...item,
      url,
      associations: association ? [association] : [],
    };
    byUrl.set(url, created);
    items.push(created);
  };

  const baseGallery = product.gallery?.length ? product.gallery : [product.image];
  baseGallery.forEach((url, index) =>
    add(url, {
      alt: index === 0 ? product.name : `${product.name} - vue ${index + 1}`,
      source: "product",
      available: true,
    }),
  );

  const variants = (product.variants ?? [])
    .filter((variant) => variant.isActive)
    .sort((left, right) => left.sortOrder - right.sortOrder);

  variants.forEach((variant) => {
    const selections = Object.fromEntries(
      (variant.selections ?? []).map((selection) => [selection.axisKey, selection.value]),
    );
    add(
      variant.imageUrl,
      {
        alt: `${product.name} - ${variant.label}`,
        label: variant.label,
        source: "variant",
        available: variant.stockQuantity > 0,
      },
      { variantId: variant.id, selections, available: variant.stockQuantity > 0 },
    );
  });

  [...(product.variantAxes ?? [])]
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .forEach((axis) => {
      [...axis.values]
        .sort((left, right) => left.sortOrder - right.sortOrder)
        .forEach((value) => {
          const matchingVariants = variants.filter((variant) =>
            variant.selections?.some(
              (selection) => selection.axisKey === axis.key && selection.value === value.value,
            ),
          );
          if (!matchingVariants.length) return;

          add(
            value.imageUrl,
            {
              alt: `${product.name} - ${axis.label} ${value.label}`,
              label: value.label,
              source: "option",
              available: matchingVariants.some((variant) => variant.stockQuantity > 0),
            },
            {
              selections: { [axis.key]: value.value },
              available: matchingVariants.some((variant) => variant.stockQuantity > 0),
            },
          );
        });
    });

  return items;
}

export function findContextualGalleryItem(
  gallery: ProductGalleryItem[],
  selectedVariant?: GalleryVariant,
  selectedOptions: Record<string, string> = {},
) {
  if (selectedVariant) {
    const associated = gallery.find((item) =>
      item.associations.some((association) => association.variantId === selectedVariant.id),
    );
    if (associated) return associated;

    const variantImage = selectedVariant.imageUrl?.trim();
    if (variantImage) return gallery.find((item) => item.url === variantImage);
  }

  const selectedEntries = Object.entries(selectedOptions).filter(([, value]) => Boolean(value));
  if (!selectedEntries.length) return undefined;

  const matchesSelection = (item: ProductGalleryItem, optionOnly: boolean) =>
    item.associations.some((association) => {
      if (optionOnly && association.variantId) return false;
      const associationEntries = Object.entries(association.selections);
      return (
        associationEntries.length > 0 &&
        associationEntries.every(([key, value]) => selectedOptions[key] === value)
      );
    });

  return (
    gallery.find((item) => matchesSelection(item, true)) ??
    gallery.find((item) => matchesSelection(item, false))
  );
}

export function getContextualGalleryAvailability(
  item: ProductGalleryItem,
  selectedVariant?: GalleryVariant,
  selectedOptions: Record<string, string> = {},
) {
  if (selectedVariant) {
    const variantAssociation = item.associations.find(
      (association) => association.variantId === selectedVariant.id,
    );
    if (variantAssociation) return variantAssociation.available;
  }

  const selectedEntries = Object.entries(selectedOptions).filter(([, value]) => Boolean(value));
  if (!selectedEntries.length) return item.available;

  const matchingAssociation = [...item.associations]
    .sort(
      (left, right) => Object.keys(right.selections).length - Object.keys(left.selections).length,
    )
    .find((association) =>
      Object.entries(association.selections).every(
        ([key, value]) => selectedOptions[key] === value,
      ),
    );

  return matchingAssociation?.available ?? item.available;
}
