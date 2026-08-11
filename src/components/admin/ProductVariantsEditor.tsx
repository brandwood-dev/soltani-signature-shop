import { ArrowDown, ArrowUp, Copy, Plus, Star, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { AdminProductVariant } from "@/lib/admin-products-api";
import { makeColorVariant } from "@/lib/product-variant-drafts";

type Props = {
  variants: AdminProductVariant[];
  onChange: (variants: AdminProductVariant[]) => void;
  defaultPrice: number;
  defaultStock: number;
  defaultLowStockThreshold: number;
};

export function ProductVariantsEditor({
  variants,
  onChange,
  defaultPrice,
  defaultStock,
  defaultLowStockThreshold,
}: Props) {
  const update = (index: number, patch: Partial<AdminProductVariant>) => {
    onChange(
      variants.map((variant, itemIndex) =>
        itemIndex === index ? { ...variant, ...patch } : variant,
      ),
    );
  };

  const add = () => {
    const next = makeColorVariant(defaultPrice, defaultStock, defaultLowStockThreshold);
    next.isDefault = variants.length === 0;
    next.sortOrder = variants.length;
    onChange([...variants, next]);
  };

  const duplicate = (index: number) => {
    const source = variants[index];
    const copy: AdminProductVariant = {
      ...source,
      id: undefined,
      sku: "",
      label: `${source.label || "Teinte"} copie`,
      reference: "",
      isDefault: false,
      sortOrder: variants.length,
    };
    onChange([...variants, copy]);
  };

  const remove = (index: number) => {
    if (variants.length === 1) return;
    const wasDefault = variants[index]?.isDefault;
    const next = variants
      .filter((_, itemIndex) => itemIndex !== index)
      .map((variant, sortOrder) => ({ ...variant, sortOrder }));
    if (wasDefault && next[0]) next[0].isDefault = true;
    onChange(next);
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= variants.length) return;
    const next = [...variants];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((variant, sortOrder) => ({ ...variant, sortOrder })));
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
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-md border border-gold/25 bg-gold/5 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold">Teintes disponibles</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            Chaque teinte possède sa référence, sa couleur, son prix et son stock.
          </p>
        </div>
        <Button type="button" variant="outline" className="min-h-11 w-full sm:w-auto" onClick={add}>
          <Plus className="h-4 w-4" /> Ajouter une teinte
        </Button>
      </div>

      {variants.map((variant, index) => (
        <div
          key={variant.id ?? `new-${index}`}
          className="rounded-lg border border-border bg-card p-3 shadow-sm sm:p-4"
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span
                className="h-10 w-10 shrink-0 rounded-full border-2 border-background shadow-[0_0_0_1px_hsl(var(--border))]"
                style={{ backgroundColor: variant.colorHex || "#C47A7A" }}
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {variant.label || `Teinte ${index + 1}`}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {variant.reference || "Référence à compléter"}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label="Monter la teinte"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                onClick={() => move(index, 1)}
                disabled={index === variants.length - 1}
                aria-label="Descendre la teinte"
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor={`variant-label-${index}`}>Nom de la teinte *</Label>
              <Input
                id={`variant-label-${index}`}
                required
                value={variant.label}
                onChange={(event) => update(index, { label: event.target.value })}
                placeholder="Ex : Rouge iconique"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`variant-reference-${index}`}>Référence couleur *</Label>
              <Input
                id={`variant-reference-${index}`}
                required
                value={variant.reference ?? ""}
                onChange={(event) => update(index, { reference: event.target.value })}
                placeholder="Ex : 001"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`variant-color-${index}`}>Code couleur *</Label>
              <div className="flex gap-2">
                <Input
                  id={`variant-color-${index}`}
                  required
                  pattern="^#[0-9A-Fa-f]{6}$"
                  value={variant.colorHex ?? ""}
                  onChange={(event) =>
                    update(index, { colorHex: event.target.value.toUpperCase() })
                  }
                  placeholder="#B73545"
                />
                <Input
                  type="color"
                  value={variant.colorHex || "#C47A7A"}
                  onChange={(event) =>
                    update(index, { colorHex: event.target.value.toUpperCase() })
                  }
                  className="h-10 w-12 shrink-0 cursor-pointer p-1"
                  aria-label={`Choisir la couleur de ${variant.label || `la teinte ${index + 1}`}`}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`variant-sku-${index}`}>SKU</Label>
              <Input
                id={`variant-sku-${index}`}
                value={variant.sku}
                onChange={(event) => update(index, { sku: event.target.value })}
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
                onChange={(event) => update(index, { price: Number(event.target.value) })}
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
                onChange={(event) => update(index, { stockQuantity: Number(event.target.value) })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`variant-low-${index}`}>Alerte stock faible</Label>
              <Input
                id={`variant-low-${index}`}
                type="number"
                min="0"
                value={variant.lowStockThreshold}
                onChange={(event) =>
                  update(index, { lowStockThreshold: Number(event.target.value) })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`variant-image-${index}`}>Image spécifique</Label>
              <Input
                id={`variant-image-${index}`}
                type="url"
                value={variant.imageUrl ?? ""}
                onChange={(event) => update(index, { imageUrl: event.target.value })}
                placeholder="https://... (facultatif)"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 sm:justify-start">
              <Label htmlFor={`variant-active-${index}`} className="text-sm">
                Teinte active
              </Label>
              <Switch
                id={`variant-active-${index}`}
                checked={variant.isActive}
                onCheckedChange={(isActive) =>
                  update(index, { isActive, isDefault: isActive ? variant.isDefault : false })
                }
              />
            </div>
            <div className="grid grid-cols-3 gap-2 sm:flex">
              <Button
                type="button"
                variant={variant.isDefault ? "default" : "outline"}
                className="min-h-11"
                onClick={() => setDefault(index)}
                disabled={!variant.isActive}
              >
                <Star className={`h-4 w-4 ${variant.isDefault ? "fill-current" : ""}`} />
                <span className="hidden xl:inline">
                  {variant.isDefault ? "Par défaut" : "Définir"}
                </span>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="min-h-11"
                onClick={() => duplicate(index)}
                aria-label="Dupliquer la teinte"
              >
                <Copy className="h-4 w-4" />
                <span className="hidden xl:inline">Dupliquer</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="min-h-11 text-destructive hover:text-destructive"
                onClick={() => remove(index)}
                disabled={variants.length === 1}
                aria-label="Retirer la teinte"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden xl:inline">Retirer</span>
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
