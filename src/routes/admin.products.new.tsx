import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ImagePlus, X, Save } from "lucide-react";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  createAdminProduct,
  MAX_PRODUCT_IMAGE_SIZE_MB,
  uploadAdminProductImage,
} from "@/lib/admin-products-api";
import { fallbackCategoryTree, loadCategoryTree, type CategoryTree } from "@/lib/categories-api";
import { getAdminFeaturedBrands } from "@/lib/featured-brands-api";
import { ProductAttributeFields } from "@/components/admin/ProductAttributeFields";
import { getAdminCategoryAttributes, type CategoryAttribute } from "@/lib/catalog-attributes-api";

export const Route = createFileRoute("/admin/products/new")({
  component: AdminNewProduct,
});

const FALLBACK_BRANDS = ["Dior", "Chanel", "YSL", "Armani", "Gucci", "Prada", "Tom Ford", "Hermès"];
const STATUSES = [
  { value: "draft", label: "Brouillon" },
  { value: "active", label: "Actif" },
  { value: "archived", label: "Archivé" },
];
const SECTIONS = [
  { value: "homme", label: "Homme" },
  { value: "femme", label: "Femme" },
  { value: "enfant", label: "Enfant" },
  { value: "maison", label: "Maison" },
  { value: "bien-etre", label: "Bien-être" },
] as const;

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function skuPreviewFor(name: string, slug: string) {
  const base = (slug || slugify(name)).replace(/-/g, "").toUpperCase().slice(0, 14);
  return base ? `SS-${base}-AUTO` : "Généré automatiquement";
}

function AdminNewProduct() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [brand, setBrand] = useState("");
  const [section, setSection] = useState<(typeof SECTIONS)[number]["value"]>("femme");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [attributes, setAttributes] = useState<Record<string, string[]>>({});
  const [categoryAttributes, setCategoryAttributes] = useState<CategoryAttribute[]>([]);
  const [attributesLoading, setAttributesLoading] = useState(false);
  const [attributesError, setAttributesError] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [price, setPrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  const [cost, setCost] = useState("");
  const [stock, setStock] = useState("");
  const [lowStockAlert, setLowStockAlert] = useState("5");
  const [weight, setWeight] = useState("");
  const [status, setStatus] = useState("draft");
  const [featured, setFeatured] = useState(false);
  const [isPromotion, setIsPromotion] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [brandOptions, setBrandOptions] = useState<string[]>(FALLBACK_BRANDS);
  const [categoryTree, setCategoryTree] = useState<CategoryTree[]>(fallbackCategoryTree());
  const [trackInventory, setTrackInventory] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [newImage, setNewImage] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    loadCategoryTree({ admin: true })
      .then((items) => {
        if (active && items.length) setCategoryTree(items);
      })
      .catch(() => undefined);
    getAdminFeaturedBrands()
      .then((items) => {
        if (!active) return;
        const names = Array.from(new Set(items.map((item) => item.name.trim()).filter(Boolean)));
        if (names.length) setBrandOptions(names);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const selectedCategory = categoryTree
      .flatMap((item) => [item, ...item.subs])
      .find((item) => item.slug === (subcategory || category));
    if (!selectedCategory) {
      setCategoryAttributes([]);
      setAttributesError("");
      return;
    }

    let active = true;
    setAttributesLoading(true);
    setAttributesError("");
    getAdminCategoryAttributes(selectedCategory.id)
      .then((items) => {
        if (active) setCategoryAttributes(items);
      })
      .catch((err) => {
        if (active) {
          setCategoryAttributes([]);
          setAttributesError(
            err instanceof Error
              ? err.message
              : "Les attributs de cette catégorie sont momentanément indisponibles.",
          );
        }
      })
      .finally(() => {
        if (active) setAttributesLoading(false);
      });

    return () => {
      active = false;
    };
  }, [category, subcategory, categoryTree]);

  const addImage = () => {
    if (!newImage.trim()) return;
    setImages((s) => [...s, newImage.trim()]);
    setNewImage("");
  };
  const removeImage = (i: number) => setImages((s) => s.filter((_, idx) => idx !== i));
  const uploadImages = async (files: FileList | null) => {
    if (!files?.length) return;
    try {
      setUploading(true);
      setError("");
      const uploaded = await Promise.all(
        Array.from(files).map((file) => uploadAdminProductImage(file)),
      );
      setImages((current) => [...current, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload image impossible.");
    } finally {
      setUploading(false);
    }
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (!t || tags.includes(t)) return;
    setTags((s) => [...s, t]);
    setTagInput("");
  };
  const removeTag = (t: string) => setTags((s) => s.filter((x) => x !== t));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");
      await createAdminProduct({
        name,
        slug: slug || slugify(name),
        shortDescription,
        description,
        price: Number(price),
        compareAtPrice: comparePrice ? Number(comparePrice) : null,
        stockQuantity: trackInventory ? Number(stock || 0) : 0,
        section,
        category,
        subcategory: subcategory || undefined,
        brand,
        tags,
        images: images.map((url) => ({ url, alt: name })),
        attributes: Object.entries(attributes).flatMap(([key, values]) =>
          values.map((value) => ({ key, value })),
        ),
        seoTitle: seoTitle || name,
        seoDescription,
        status: status as "draft" | "active" | "archived",
        isFeatured: featured,
        isPromotion,
        discountPercentage: isPromotion ? Number(discountPercentage || 0) : null,
        isBestSeller,
        lowStockThreshold: Number(lowStockAlert || 5),
      });
      navigate({ to: "/admin/products" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'enregistrer le produit.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AdminHeader
        title="Nouveau produit"
        subtitle="Remplissez les informations puis enregistrez le brouillon"
        actions={
          <div className="flex gap-2">
            <Button asChild variant="ghost" size="sm" className="h-9">
              <Link to="/admin/products">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Retour</span>
              </Link>
            </Button>
            <Button form="new-product-form" type="submit" size="sm" className="h-9">
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline">{saving ? "Enregistrement…" : "Enregistrer"}</span>
            </Button>
          </div>
        }
      />

      <form id="new-product-form" onSubmit={handleSubmit} className="flex-1 p-3 sm:p-6">
        {error && (
          <div className="mb-4 rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <div className="grid gap-3 sm:gap-6 lg:grid-cols-3">
          {/* Colonne principale */}
          <div className="space-y-3 sm:space-y-6 lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Informations générales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Nom du produit *</Label>
                  <Input
                    id="name"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!slug) setSlug(slugify(e.target.value));
                    }}
                    placeholder="Ex : Eau de Parfum Sauvage 100ml"
                    maxLength={120}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="slug">URL (slug)</Label>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="auto-généré"
                  />
                  <p className="text-xs text-muted-foreground">/product/{slug || "..."}</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="short">Description courte</Label>
                  <Textarea
                    id="short"
                    rows={2}
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="Résumé affiché dans les listes (max 160 caractères)"
                    maxLength={160}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="desc">Description complète</Label>
                  <Textarea
                    id="desc"
                    rows={6}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description détaillée, notes olfactives, conseils d'utilisation…"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                    placeholder="URL de l'image"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addImage();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addImage}>
                    <ImagePlus className="h-4 w-4" />
                    <span className="hidden sm:inline">Ajouter</span>
                  </Button>
                </div>
                <div>
                  <Input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    disabled={uploading}
                    onChange={(event) => uploadImages(event.target.files)}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {uploading
                      ? "Upload en cours…"
                      : "Vous pouvez aussi uploader plusieurs images."}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Taille maximale : {MAX_PRODUCT_IMAGE_SIZE_MB} Mo par image.
                  </p>
                </div>
                {images.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {images.map((src, i) => (
                      <div
                        key={i}
                        className="group relative aspect-square overflow-hidden rounded-md border border-border bg-muted"
                      >
                        <img
                          src={src}
                          alt=""
                          onError={(event) => {
                            event.currentTarget.src = "/placeholder.svg";
                          }}
                          className="h-full w-full object-contain object-center p-2"
                        />
                        {i === 0 && (
                          <span className="absolute left-1 top-1 rounded bg-background/90 px-1.5 py-0.5 text-[10px] font-medium">
                            Principale
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition group-hover:opacity-100"
                          aria-label="Supprimer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid place-items-center rounded-md border border-dashed border-border py-8 text-center">
                    <ImagePlus className="h-6 w-6 text-muted-foreground" />
                    <p className="mt-2 text-xs text-muted-foreground">Ajoutez au moins une image</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Prix & stock</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="price">Prix de vente (DT) *</Label>
                    <Input
                      id="price"
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="compare">Prix barré (DT)</Label>
                    <Input
                      id="compare"
                      type="number"
                      min="0"
                      step="0.01"
                      value={comparePrice}
                      onChange={(e) => setComparePrice(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cost">Coût (DT)</Label>
                    <Input
                      id="cost"
                      type="number"
                      min="0"
                      step="0.01"
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                  <Label className="text-sm">Suivre l'inventaire</Label>
                  <Switch checked={trackInventory} onCheckedChange={setTrackInventory} />
                </div>
                {trackInventory && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="stock">Quantité en stock</Label>
                      <Input
                        id="stock"
                        type="number"
                        min="0"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="low">Alerte stock faible</Label>
                      <Input
                        id="low"
                        type="number"
                        min="0"
                        value={lowStockAlert}
                        onChange={(e) => setLowStockAlert(e.target.value)}
                      />
                    </div>
                  </div>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      value={skuPreviewFor(name, slug)}
                      readOnly
                      aria-readonly="true"
                      className="bg-muted text-muted-foreground"
                    />
                    <p className="text-xs text-muted-foreground">
                      Le SKU final est généré automatiquement côté serveur et conservé après
                      création.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="weight">Poids (g)</Label>
                    <Input
                      id="weight"
                      type="number"
                      min="0"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="seo-title">Titre SEO</Label>
                  <Input
                    id="seo-title"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder={name || "Auto à partir du nom"}
                    maxLength={60}
                  />
                  <p className="text-xs text-muted-foreground">
                    {(seoTitle || name).length}/60 caractères
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="seo-desc">Meta description</Label>
                  <Textarea
                    id="seo-desc"
                    rows={2}
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    maxLength={160}
                  />
                  <p className="text-xs text-muted-foreground">
                    {seoDescription.length}/160 caractères
                  </p>
                </div>
              </CardContent>
            </Card>

            {(category || subcategory) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Attributs & filtres</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Ces attributs proviennent de la configuration dynamique de la catégorie
                    sélectionnée.
                  </p>
                </CardHeader>
                <CardContent>
                  {attributesError ? (
                    <p className="text-sm text-destructive">{attributesError}</p>
                  ) : attributesLoading ? (
                    <p className="text-sm text-muted-foreground">Chargement des attributs?</p>
                  ) : (
                    <ProductAttributeFields
                      attributes={categoryAttributes}
                      values={attributes}
                      onChange={setAttributes}
                    />
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Colonne latérale */}
          <div className="space-y-3 sm:space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Publication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Statut</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                  <Label className="text-sm">Mettre en avant</Label>
                  <Switch checked={featured} onCheckedChange={setFeatured} />
                </div>
                <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                  <Label className="text-sm">Produit en promotion</Label>
                  <Switch checked={isPromotion} onCheckedChange={setIsPromotion} />
                </div>
                {isPromotion && (
                  <div className="space-y-1.5">
                    <Label htmlFor="discount">Pourcentage de réduction</Label>
                    <Input
                      id="discount"
                      required
                      type="number"
                      min="1"
                      max="100"
                      value={discountPercentage}
                      onChange={(e) => setDiscountPercentage(e.target.value)}
                    />
                  </div>
                )}
                <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                  <Label className="text-sm">Best seller</Label>
                  <Switch checked={isBestSeller} onCheckedChange={setIsBestSeller} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Organisation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Section *</Label>
                  <Select
                    value={section}
                    onValueChange={(value) => setSection(value as typeof section)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir" />
                    </SelectTrigger>
                    <SelectContent>
                      {SECTIONS.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Catégorie *</Label>
                  <Select
                    value={category}
                    onValueChange={(v) => {
                      setCategory(v);
                      setSubcategory("");
                      setAttributes({});
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryTree.map((c) => (
                        <SelectItem key={c.slug} value={c.slug}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Sous-catégorie</Label>
                  <Select
                    value={subcategory}
                    onValueChange={(v) => {
                      setSubcategory(v);
                      setAttributes({});
                    }}
                    disabled={!category}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={category ? "Choisir" : "Sélectionnez d'abord une catégorie"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {(categoryTree.find((c) => c.slug === category)?.subs ?? []).map((s) => (
                        <SelectItem key={s.slug} value={s.slug}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Marque</Label>
                  <Select value={brand} onValueChange={setBrand}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir" />
                    </SelectTrigger>
                    <SelectContent>
                      {brandOptions.map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Ajouter un tag"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={addTag}>
                      OK
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {tags.map((t) => (
                        <Badge key={t} variant="secondary" className="gap-1 pr-1">
                          {t}
                          <button
                            type="button"
                            onClick={() => removeTag(t)}
                            className="rounded-full p-0.5 hover:bg-muted-foreground/20"
                            aria-label={`Retirer ${t}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2 lg:hidden">
              <Button asChild variant="outline" className="flex-1">
                <Link to="/admin/products">Annuler</Link>
              </Button>
              <Button type="submit" className="flex-1">
                Enregistrer
              </Button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
