import { Plus, Sparkles, Star, Trash2 } from "lucide-react";
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
  const combinationCount = variantCombinationCount(axes);

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
    onChange(
      generateVariantCombinations(axes, variants, {
        price: defaultPrice,
        stockQuantity: defaultStock,
        lowStockThreshold: defaultLowStockThreshold,
      }),
    );
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
        <div className="flex flex-col gap-3 rounded-lg border border-dashed p-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm">
            <span className="font-semibold">{combinationCount}</span> combinaison
            {combinationCount > 1 ? "s" : ""} à générer
            {combinationCount > MAX_COMBINATIONS ? (
              <span className="ml-2 text-destructive">Maximum: {MAX_COMBINATIONS}</span>
            ) : null}
          </p>
          <Button
            type="button"
            className="min-h-11 w-full sm:w-auto"
            onClick={generate}
            disabled={!combinationCount || combinationCount > MAX_COMBINATIONS}
          >
            <Sparkles className="h-4 w-4" /> Générer / actualiser
          </Button>
        </div>
      ) : null}

      {variants.length > 0 ? (
        <div className="space-y-3">
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
              <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
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
                    value={variant.price}
                    onChange={(event) =>
                      updateVariant(index, { price: Number(event.target.value) })
                    }
                  />
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
