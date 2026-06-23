import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ImagePlus, X, Save, Trash2, Eye } from "lucide-react";

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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { MOCK_PRODUCTS } from "@/lib/admin/mock-data";

const CATEGORIES = ["Parfums", "Soins", "Maquillage", "Sacs", "Montres", "Accessoires"];
const BRANDS = ["Dior", "Chanel", "YSL", "Armani", "Gucci", "Prada", "Tom Ford", "Hermès"];
const STATUSES = [
  { value: "draft", label: "Brouillon" },
  { value: "active", label: "Actif" },
  { value: "archived", label: "Archivé" },
];

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const Route = createFileRoute("/admin/products/$id/edit")({
  component: AdminEditProduct,
  notFoundComponent: () => (
    <div className="p-8 text-center text-sm text-muted-foreground">
      Produit introuvable.{" "}
      <Link to="/admin/products" className="text-primary underline">
        Retour à la liste
      </Link>
    </div>
  ),
  loader: ({ params }) => {
    const product = MOCK_PRODUCTS.find((p) => p.id === params.id);
    if (!product) throw notFound();
    return { product };
  },
});

function AdminEditProduct() {
  const navigate = useNavigate();
  const { product } = Route.useLoaderData();

  const [name, setName] = useState(product.name);
  const [slug, setSlug] = useState(slugify(product.name));
  const [sku, setSku] = useState(product.sku);
  const [brand, setBrand] = useState(product.brand);
  const [category, setCategory] = useState(product.category);
  const [subcategory, setSubcategory] = useState("");
  const [description, setDescription] = useState(
    `${product.name} — un produit ${product.brand} de la catégorie ${product.category}.`
  );
  const [shortDescription, setShortDescription] = useState(
    `${product.brand} · ${product.category}`
  );
  const [price, setPrice] = useState(product.price.toString());
  const [comparePrice, setComparePrice] = useState("");
  const [cost, setCost] = useState("");
  const [stock, setStock] = useState(product.stock.toString());
  const [lowStockAlert, setLowStockAlert] = useState("5");
  const [weight, setWeight] = useState("");
  const [status, setStatus] = useState(product.status);
  const [featured, setFeatured] = useState(false);
  const [trackInventory, setTrackInventory] = useState(true);
  const [images, setImages] = useState<string[]>([product.image]);
  const [newImage, setNewImage] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([product.brand, product.category]);
  const [seoTitle, setSeoTitle] = useState(product.name);
  const [seoDescription, setSeoDescription] = useState("");

  const addImage = () => {
    if (!newImage.trim()) return;
    setImages((s) => [...s, newImage.trim()]);
    setNewImage("");
  };
  const removeImage = (i: number) => setImages((s) => s.filter((_, idx) => idx !== i));

  const addTag = () => {
    const t = tagInput.trim();
    if (!t || tags.includes(t)) return;
    setTags((s) => [...s, t]);
    setTagInput("");
  };
  const removeTag = (t: string) => setTags((s) => s.filter((x) => x !== t));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/admin/products" });
  };

  return (
    <>
      <AdminHeader
        title={`Modifier — ${product.name}`}
        subtitle={`SKU ${product.sku}`}
        actions={
          <div className="flex gap-2">
            <Button asChild variant="ghost" size="sm" className="h-9">
              <Link to="/admin/products">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Retour</span>
              </Link>
            </Button>
            <Button form="edit-product-form" type="submit" size="sm" className="h-9">
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline">Enregistrer</span>
            </Button>
          </div>
        }
      />

      <form id="edit-product-form" onSubmit={handleSubmit} className="flex-1 p-3 sm:p-6">
        <div className="grid gap-3 sm:gap-6 lg:grid-cols-3">
          {/* Main column */}
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
                    onChange={(e) => setName(e.target.value)}
                    maxLength={120}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="slug">URL (slug)</Label>
                  <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
                  <p className="text-xs text-muted-foreground">/product/{slug || "..."}</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="short">Description courte</Label>
                  <Textarea
                    id="short"
                    rows={2}
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
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
                {images.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {images.map((src, i) => (
                      <div
                        key={i}
                        className="group relative aspect-square overflow-hidden rounded-md border border-border bg-muted"
                      >
                        <img src={src} alt="" className="h-full w-full object-cover" />
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
                    <p className="mt-2 text-xs text-muted-foreground">
                      Ajoutez au moins une image
                    </p>
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
                    <Input id="sku" value={sku} onChange={(e) => setSku(e.target.value)} />
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
                    maxLength={60}
                  />
                  <p className="text-xs text-muted-foreground">
                    {seoTitle.length}/60 caractères
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
          </div>

          {/* Side */}
          <div className="space-y-3 sm:space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Publication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Statut</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
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
                <Button type="button" variant="outline" className="w-full" size="sm">
                  <Eye className="h-4 w-4" />
                  Aperçu
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Organisation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Catégorie *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sub">Sous-catégorie</Label>
                  <Input
                    id="sub"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Marque</Label>
                  <Select value={brand} onValueChange={setBrand}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir" />
                    </SelectTrigger>
                    <SelectContent>
                      {BRANDS.map((b) => (
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

            <Card className="border-destructive/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-destructive">
                  Zone de danger
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Supprimer le produit
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Supprimer ce produit ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action est irréversible. Le produit "{product.name}" sera
                        retiré du catalogue.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => navigate({ to: "/admin/products" })}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Supprimer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
