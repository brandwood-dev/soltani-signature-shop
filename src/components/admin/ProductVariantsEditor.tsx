import { BadgeDollarSign, Plus, Sparkles, Star, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type {
  AdminProductVariant,
  AdminProductVariantAxis,
  AdminVariantDisplayType,
} from "@/lib/admin-products-api";
import {
  generateVariantCombinations,
  makeVariantAxis,
  makeVariantValue,
  slugifyVariantValue,
  variantCombinationCount,
  VARIANT_AXIS_TEMPLATES,
} from "@/lib/product-variant-drafts";

type Props = {
  axes: AdminProductVariantAxis[];
  onAxesChange: (axes: AdminProductVariantAxis[]) => void;
  variants: AdminProductVariant[];
  onChange: (variants: AdminProductVariant[]) => void;
  defaultPrice: number;
  defaultStock: number;
  defaultLowStockThreshold: number;
};

const MAX_AXES = 3;
const MAX_COMBINATIONS = 100;

type PriceDraft = { price: string; compareAtPrice: string };

function priceFromDraft(value: string) {
  if (!value.trim()) return null;
  const price = Number(value);
  return Number.isFinite(price) && price >= 0 ? price : null;
}

function displayPrice(value: number) {
  return value
    .toFixed(3)
    .replace(/\.000$/, "")
    .replace(/(\.\d*[1-9])0+$/, "$1");
}

export function ProductVariantsEditor({
  axes,
  onAxesChange,
  variants,
  onChange,
  defaultPrice,
  defaultStock,
  defaultLowStockThreshold,
}: Props) {
  const [axisTemplate, setAxisTemplate] = useState("color");
  const [bulkPrice, setBulkPrice] = useState(defaultPrice ? String(defaultPrice) : "");
  const [bulkCompareAtPrice, setBulkCompareAtPrice] = useState("");
  const [pricingAxisKey, setPricingAxisKey] = useState(axes[0]?.key ?? "");
  const [axisPriceDrafts, setAxisPriceDrafts] = useState<Record<string, PriceDraft>>({});
  const [pricingFeedback, setPricingFeedback] = useState<{
    kind: "success" | "error";
    message: string;
  } | null>(null);
  const combinationCount = variantCombinationCount(axes);
  const activeVariants = variants.filter((variant) => variant.isActive);
  const activePrices = activeVariants.map((variant) => variant.price);
  const priceMin = activePrices.length ? Math.min(...activePrices) : 0;
  const priceMax = activePrices.length ? Math.max(...activePrices) : 0;
  const pricingAxis = axes.find((axis) => axis.key === pricingAxisKey) ?? axes[0];

  const updateAxis = (index: number, patch: Partial<AdminProductVariantAxis>) => {
    onAxesChange(
      axes.map((axis, itemIndex) => (itemIndex === index ? { ...axis, ...patch } : axis)),
    );
  };

  const addAxis = () => {
    if (axes.length >= MAX_AXES) return;
    const next = makeVariantAxis(axisTemplate, axes);
    if (axes.some((axis) => axis.key === next.key)) return;
    onAxesChange([...axes, next]);
    onChange([]);
  };

  const removeAxis = (index: number) => {
    onAxesChange(
      axes
        .filter((_, itemIndex) => itemIndex !== index)
        .map((axis, sortOrder) => ({ ...axis, sortOrder })),
    );
    onChange([]);
  };

  const generate = () => {
    const generatedPrice = priceFromDraft(bulkPrice) ?? defaultPrice;
    if (!Number.isFinite(generatedPrice) || generatedPrice < 0) {
      setPricingFeedback({ kind: "error", message: "Saisissez un prix initial valide." });
      return;
    }
    onChange(
      generateVariantCombinations(axes, variants, {
        price: generatedPrice,
        stockQuantity: defaultStock,
        lowStockThreshold: defaultLowStockThreshold,
      }),
    );
    setPricingFeedback(null);
  };

  const updateVariant = (index: number, patch: Partial<AdminProductVariant>) => {
    onChange(
      variants.map((variant, itemIndex) =>
        itemIndex === index ? { ...variant, ...patch } : variant,
      ),
    );
  };

  const setDefault = (index: number) => {
    onChange(
      variants.map((variant, itemIndex) => ({
        ...variant,
        isDefault: itemIndex === index,
        isActive: itemIndex === index ? true : variant.isActive,
      })),
    );
  };

  const applyBulkPricing = () => {
    const nextPrice = priceFromDraft(bulkPrice);
    const nextCompareAtPrice = priceFromDraft(bulkCompareAtPrice);
    if (nextPrice === null) {
      setPricingFeedback({ kind: "error", message: "Saisissez un prix de vente valide." });
      return;
    }
    if (bulkCompareAtPrice.trim() && nextCompareAtPrice === null) {
      setPricingFeedback({ kind: "error", message: "Le prix barré doit être un nombre positif." });
      return;
    }
    if (nextCompareAtPrice !== null && nextCompareAtPrice <= nextPrice) {
      setPricingFeedback({
        kind: "error",
        message: "Le prix barré doit être supérieur au prix de vente.",
      });
      return;
    }
    onChange(
      variants.map((variant) => ({
        ...variant,
        price: nextPrice,
        compareAtPrice: nextCompareAtPrice,
      })),
    );
    setPricingFeedback({
      kind: "success",
      message: `Tarif appliqué à ${variants.length} combinaison${variants.length > 1 ? "s" : ""}.`,
    });
  };

  const applyAxisPricing = () => {
    if (!pricingAxis) return;
    const updates = new Map<string, { price: number; compareAtPrice: number | null }>();
    for (const value of pricingAxis.values.filter((item) => item.isActive)) {
      const draft = axisPriceDrafts[`${pricingAxis.key}:${value.value}`];
      if (!draft?.price.trim()) continue;
      const nextPrice = priceFromDraft(draft.price);
      const nextCompareAtPrice = priceFromDraft(draft.compareAtPrice);
      if (nextPrice === null || (draft.compareAtPrice.trim() && nextCompareAtPrice === null)) {
        setPricingFeedback({
          kind: "error",
          message: `Le tarif de « ${value.label} » n’est pas valide.`,
        });
        return;
      }
      if (nextCompareAtPrice !== null && nextCompareAtPrice <= nextPrice) {
        setPricingFeedback({
          kind: "error",
          message: `Le prix barré de « ${value.label} » doit dépasser son prix de vente.`,
        });
        return;
      }
      updates.set(value.value, { price: nextPrice, compareAtPrice: nextCompareAtPrice });
    }
    if (!updates.size) {
      setPricingFeedback({
        kind: "error",
        message: `Renseignez au moins un tarif pour l’axe « ${pricingAxis.label} ».`,
      });
      return;
    }
    let updatedCount = 0;
    onChange(
      variants.map((variant) => {
        const selection = variant.selections?.find((item) => item.axisKey === pricingAxis.key);
        const pricing = selection ? updates.get(selection.value) : undefined;
        if (!pricing) return variant;
        updatedCount += 1;
        return { ...variant, ...pricing };
      }),
    );
    setPricingFeedback({
      kind: "success",
      message: `${updatedCount} combinaison${updatedCount > 1 ? "s" : ""} mise${
        updatedCount > 1 ? "s" : ""
      } à jour par ${pricingAxis.label.toLowerCase()}.`,
    });
  };

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-gold/25 bg-gold/5 p-3 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold">Options du produit</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Ajoutez jusqu’à trois axes. Chaque combinaison aura son propre prix, SKU et stock.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-[minmax(0,220px)_auto]">
            <Select value={axisTemplate} onValueChange={setAxisTemplate}>
              <SelectTrigger className="min-h-11 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VARIANT_AXIS_TEMPLATES.map((template) => (
                  <SelectItem
                    key={template.key}
                    value={template.key}
                    disabled={
                      template.key !== "custom" && axes.some((axis) => axis.key === template.key)
                    }
                  >
                    {template.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              onClick={addAxis}
              disabled={axes.length >= MAX_AXES}
            >
              <Plus className="h-4 w-4" /> Ajouter un axe
            </Button>
          </div>
        </div>
      </div>

      {axes.map((axis, axisIndex) => (
        <section
          key={axis.id ?? `${axis.key}-${axisIndex}`}
          className="rounded-lg border bg-card p-3 sm:p-4"
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_180px_auto] lg:items-end">
            <div className="space-y-1.5">
              <Label htmlFor={`axis-label-${axisIndex}`}>Nom de l’option *</Label>
              <Input
                id={`axis-label-${axisIndex}`}
                required
                value={axis.label}
                onChange={(event) => {
                  const label = event.target.value;
                  updateAxis(axisIndex, {
                    label,
                    key: axis.id ? axis.key : slugifyVariantValue(label),
                  });
                }}
                placeholder="Ex : Taille"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`axis-key-${axisIndex}`}>Clé technique *</Label>
              <Input
                id={`axis-key-${axisIndex}`}
                required
                pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                value={axis.key}
                onChange={(event) =>
                  updateAxis(axisIndex, { key: slugifyVariantValue(event.target.value) })
                }
                placeholder="taille"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Affichage</Label>
              <Select
                value={axis.displayType}
                onValueChange={(displayType) =>
                  updateAxis(axisIndex, { displayType: displayType as AdminVariantDisplayType })
                }
              >
                <SelectTrigger className="min-h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="swatch">Pastilles couleur</SelectItem>
                  <SelectItem value="button">Boutons</SelectItem>
                  <SelectItem value="select">Liste</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant="outline"
              className="min-h-10 text-destructive hover:text-destructive"
              onClick={() => removeAxis(axisIndex)}
            >
              <Trash2 className="h-4 w-4" /> Retirer
            </Button>
          </div>

          <div className="mt-4 space-y-3 border-t pt-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Valeurs de {axis.label || "l’option"}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  updateAxis(axisIndex, {
                    values: [
                      ...axis.values,
                      {
                        ...makeVariantValue("", axis.displayType === "swatch" ? "#C47A7A" : null),
                        sortOrder: axis.values.length,
                      },
                    ],
                  })
                }
              >
                <Plus className="h-4 w-4" /> Ajouter
              </Button>
            </div>

            {axis.values.map((value, valueIndex) => (
              <div
                key={value.id ?? `${axis.key}-value-${valueIndex}`}
                className="grid gap-2 rounded-md border bg-background p-2.5 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end"
              >
                <div className="space-y-1.5">
                  <Label htmlFor={`value-label-${axisIndex}-${valueIndex}`}>Libellé *</Label>
                  <Input
                    id={`value-label-${axisIndex}-${valueIndex}`}
                    required
                    value={value.label}
                    onChange={(event) => {
                      const label = event.target.value;
                      updateAxis(axisIndex, {
                        values: axis.values.map((item, itemIndex) =>
                          itemIndex === valueIndex
                            ? {
                                ...item,
                                label,
                                value: item.id ? item.value : slugifyVariantValue(label),
                              }
                            : item,
                        ),
                      });
                    }}
                    placeholder={axis.key === "contenance" ? "Ex : 50 ml" : "Ex : Rouge, M, XL"}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`value-code-${axisIndex}-${valueIndex}`}>Référence</Label>
                  <Input
                    id={`value-code-${axisIndex}-${valueIndex}`}
                    value={value.code ?? ""}
                    onChange={(event) =>
                      updateAxis(axisIndex, {
                        values: axis.values.map((item, itemIndex) =>
                          itemIndex === valueIndex ? { ...item, code: event.target.value } : item,
                        ),
                      })
                    }
                    placeholder="Facultatif"
                  />
                </div>
                {axis.displayType === "swatch" ? (
                  <div className="space-y-1.5">
                    <Label htmlFor={`value-color-${axisIndex}-${valueIndex}`}>Code couleur *</Label>
                    <div className="flex gap-2">
                      <Input
                        id={`value-color-${axisIndex}-${valueIndex}`}
                        required
                        pattern="^#[0-9A-Fa-f]{6}$"
                        value={value.colorHex ?? ""}
                        onChange={(event) =>
                          updateAxis(axisIndex, {
                            values: axis.values.map((item, itemIndex) =>
                              itemIndex === valueIndex
                                ? { ...item, colorHex: event.target.value.toUpperCase() }
                                : item,
                            ),
                          })
                        }
                      />
                      <Input
                        type="color"
                        value={value.colorHex || "#C47A7A"}
                        onChange={(event) =>
                          updateAxis(axisIndex, {
                            values: axis.values.map((item, itemIndex) =>
                              itemIndex === valueIndex
                                ? { ...item, colorHex: event.target.value.toUpperCase() }
                                : item,
                            ),
                          })
                        }
                        className="h-10 w-12 shrink-0 cursor-pointer p-1"
                        aria-label={`Choisir la couleur ${value.label || valueIndex + 1}`}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <Label htmlFor={`value-image-${axisIndex}-${valueIndex}`}>
                      Image spécifique
                    </Label>
                    <Input
                      id={`value-image-${axisIndex}-${valueIndex}`}
                      type="url"
                      value={value.imageUrl ?? ""}
                      onChange={(event) =>
                        updateAxis(axisIndex, {
                          values: axis.values.map((item, itemIndex) =>
                            itemIndex === valueIndex
                              ? { ...item, imageUrl: event.target.value }
                              : item,
                          ),
                        })
                      }
                      placeholder="https://..."
                    />
                  </div>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 text-destructive hover:text-destructive"
                  disabled={axis.values.length === 1}
                  onClick={() => {
                    updateAxis(axisIndex, {
                      values: axis.values
                        .filter((_, itemIndex) => itemIndex !== valueIndex)
                        .map((item, sortOrder) => ({ ...item, sortOrder })),
                    });
                    onChange([]);
                  }}
                  aria-label={`Retirer ${value.label || "la valeur"}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </section>
      ))}

      {axes.length > 0 ? (
        <div className="grid gap-3 rounded-lg border border-dashed p-3 lg:grid-cols-[minmax(0,1fr)_180px_auto] lg:items-end">
          <div>
            <p className="text-sm">
              <span className="font-semibold">{combinationCount}</span> combinaison
              {combinationCount > 1 ? "s" : ""} à générer
              {combinationCount > MAX_COMBINATIONS ? (
                <span className="ml-2 text-destructive">Maximum: {MAX_COMBINATIONS}</span>
              ) : null}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Le prix initial reste modifiable par combinaison après la génération.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="variant-initial-price">Prix initial (DT)</Label>
            <Input
              id="variant-initial-price"
              type="number"
              min="0"
              step="0.001"
              inputMode="decimal"
              value={bulkPrice}
              onChange={(event) => setBulkPrice(event.target.value)}
              placeholder="Ex : 49"
            />
          </div>
          <Button
            type="button"
            className="min-h-11 w-full lg:w-auto"
            onClick={generate}
            disabled={!combinationCount || combinationCount > MAX_COMBINATIONS}
          >
            <Sparkles className="h-4 w-4" /> Générer / actualiser
          </Button>
        </div>
      ) : null}

      {variants.length > 0 ? (
        <div className="space-y-4">
          <section className="overflow-hidden rounded-xl border border-gold/30 bg-[linear-gradient(135deg,hsl(var(--card)),hsl(var(--gold)/0.08))]">
            <div className="grid gap-4 border-b border-gold/20 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold/15 text-gold">
                  <BadgeDollarSign className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold">Assistant de tarification</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Appliquez un prix commun, puis ajustez rapidement les écarts par option.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center sm:min-w-64">
                <div className="rounded-lg border bg-background/80 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Actives
                  </p>
                  <p className="mt-1 text-sm font-semibold">{activeVariants.length}</p>
                </div>
                <div className="rounded-lg border bg-background/80 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Fourchette
                  </p>
                  <p className="mt-1 text-sm font-semibold tabular-nums">
                    {priceMin === priceMax
                      ? `${displayPrice(priceMin)} DT`
                      : `${displayPrice(priceMin)} – ${displayPrice(priceMax)} DT`}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 p-4 xl:grid-cols-2">
              <div className="rounded-lg border bg-background/85 p-3 sm:p-4">
                <p className="text-sm font-semibold">Même tarif partout</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Idéal pour initialiser toutes les combinaisons en une action.
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="variant-bulk-price">Prix de vente (DT) *</Label>
                    <Input
                      id="variant-bulk-price"
                      type="number"
                      min="0"
                      step="0.001"
                      inputMode="decimal"
                      value={bulkPrice}
                      onChange={(event) => setBulkPrice(event.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="variant-bulk-compare">Prix barré (facultatif)</Label>
                    <Input
                      id="variant-bulk-compare"
                      type="number"
                      min="0"
                      step="0.001"
                      inputMode="decimal"
                      value={bulkCompareAtPrice}
                      onChange={(event) => setBulkCompareAtPrice(event.target.value)}
                      placeholder="Aucun"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-3 min-h-11 w-full"
                  onClick={applyBulkPricing}
                >
                  Appliquer aux {variants.length} combinaisons
                </Button>
              </div>

              <div className="rounded-lg border bg-background/85 p-3 sm:p-4">
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px] sm:items-end">
                  <div>
                    <p className="text-sm font-semibold">Tarifs par option</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Exemple : un prix pour 30 ml, un autre pour 100 ml.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Option tarifaire</Label>
                    <Select value={pricingAxis?.key} onValueChange={setPricingAxisKey}>
                      <SelectTrigger className="min-h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {axes.map((axis) => (
                          <SelectItem key={axis.key} value={axis.key}>
                            {axis.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1">
                  {pricingAxis?.values
                    .filter((value) => value.isActive)
                    .map((value) => {
                      const key = `${pricingAxis.key}:${value.value}`;
                      const draft = axisPriceDrafts[key] ?? { price: "", compareAtPrice: "" };
                      return (
                        <div
                          key={key}
                          className="grid gap-2 rounded-md border p-2.5 sm:grid-cols-[minmax(90px,1fr)_120px_120px] sm:items-end"
                        >
                          <p className="self-center truncate text-sm font-medium">{value.label}</p>
                          <div className="space-y-1">
                            <Label htmlFor={`axis-price-${key}`} className="text-xs">
                              Prix (DT)
                            </Label>
                            <Input
                              id={`axis-price-${key}`}
                              type="number"
                              min="0"
                              step="0.001"
                              inputMode="decimal"
                              value={draft.price}
                              onChange={(event) =>
                                setAxisPriceDrafts((current) => ({
                                  ...current,
                                  [key]: { ...draft, price: event.target.value },
                                }))
                              }
                              placeholder="Inchangé"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor={`axis-compare-${key}`} className="text-xs">
                              Barré
                            </Label>
                            <Input
                              id={`axis-compare-${key}`}
                              type="number"
                              min="0"
                              step="0.001"
                              inputMode="decimal"
                              value={draft.compareAtPrice}
                              onChange={(event) =>
                                setAxisPriceDrafts((current) => ({
                                  ...current,
                                  [key]: { ...draft, compareAtPrice: event.target.value },
                                }))
                              }
                              placeholder="Aucun"
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-3 min-h-11 w-full"
                  onClick={applyAxisPricing}
                >
                  Appliquer les tarifs renseignés
                </Button>
              </div>
            </div>
            {pricingFeedback ? (
              <p
                className={`border-t px-4 py-3 text-sm ${
                  pricingFeedback.kind === "error"
                    ? "border-destructive/20 bg-destructive/5 text-destructive"
                    : "border-emerald-600/20 bg-emerald-600/5 text-emerald-700"
                }`}
                role={pricingFeedback.kind === "error" ? "alert" : "status"}
                aria-live="polite"
              >
                {pricingFeedback.message}
              </p>
            ) : null}
          </section>

          <div>
            <p className="text-sm font-semibold">Combinaisons vendables</p>
            <p className="text-xs text-muted-foreground">
              Les stocks et prix sont indépendants pour chaque combinaison.
            </p>
          </div>
          {variants.map((variant, index) => (
            <article
              key={variant.id ?? `${variant.label}-${index}`}
              className="rounded-lg border bg-card p-3 sm:p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{variant.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {variant.selections?.map((selection) => selection.value).join(" · ")}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 sm:justify-start">
                  <Label htmlFor={`variant-active-${index}`}>Active</Label>
                  <Switch
                    id={`variant-active-${index}`}
                    checked={variant.isActive}
                    onCheckedChange={(isActive) =>
                      updateVariant(index, {
                        isActive,
                        isDefault: isActive ? variant.isDefault : false,
                      })
                    }
                  />
                </div>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
                <div className="space-y-1.5">
                  <Label htmlFor={`variant-sku-${index}`}>SKU</Label>
                  <Input
                    id={`variant-sku-${index}`}
                    value={variant.sku}
                    onChange={(event) => updateVariant(index, { sku: event.target.value })}
                    placeholder="Généré automatiquement"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`variant-price-${index}`}>Prix (DT) *</Label>
                  <Input
                    id={`variant-price-${index}`}
                    required
                    type="number"
                    min="0"
                    step="0.001"
                    inputMode="decimal"
                    value={variant.price}
                    onChange={(event) => {
                      const nextPrice = Number(event.target.value);
                      updateVariant(index, {
                        price: nextPrice,
                        compareAtPrice:
                          variant.compareAtPrice !== null && variant.compareAtPrice <= nextPrice
                            ? null
                            : variant.compareAtPrice,
                      });
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`variant-compare-${index}`}>Prix barré</Label>
                  <Input
                    id={`variant-compare-${index}`}
                    type="number"
                    min={variant.price + 0.001}
                    step="0.001"
                    inputMode="decimal"
                    value={variant.compareAtPrice ?? ""}
                    aria-invalid={
                      variant.compareAtPrice !== null && variant.compareAtPrice <= variant.price
                    }
                    onChange={(event) =>
                      updateVariant(index, {
                        compareAtPrice: event.target.value ? Number(event.target.value) : null,
                      })
                    }
                    placeholder="Facultatif"
                  />
                  {variant.compareAtPrice !== null && variant.compareAtPrice <= variant.price ? (
                    <p className="text-xs text-destructive">Doit dépasser le prix de vente.</p>
                  ) : null}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`variant-stock-${index}`}>Stock *</Label>
                  <Input
                    id={`variant-stock-${index}`}
                    required
                    type="number"
                    min="0"
                    value={variant.stockQuantity}
                    onChange={(event) =>
                      updateVariant(index, { stockQuantity: Number(event.target.value) })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`variant-low-${index}`}>Alerte stock</Label>
                  <Input
                    id={`variant-low-${index}`}
                    type="number"
                    min="0"
                    value={variant.lowStockThreshold}
                    onChange={(event) =>
                      updateVariant(index, { lowStockThreshold: Number(event.target.value) })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`variant-image-${index}`}>Image spécifique</Label>
                  <Input
                    id={`variant-image-${index}`}
                    type="url"
                    value={variant.imageUrl ?? ""}
                    onChange={(event) => updateVariant(index, { imageUrl: event.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant={variant.isDefault ? "default" : "outline"}
                    className="min-h-10 w-full"
                    onClick={() => setDefault(index)}
                    disabled={!variant.isActive}
                  >
                    <Star className={`h-4 w-4 ${variant.isDefault ? "fill-current" : ""}`} />
                    {variant.isDefault ? "Par défaut" : "Définir"}
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}
