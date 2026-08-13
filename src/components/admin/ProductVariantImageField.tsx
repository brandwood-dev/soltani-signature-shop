import { ImageIcon, Link2, LoaderCircle, Trash2, Upload } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { importAdminProductImageUrl, uploadAdminProductImage } from "@/lib/admin-products-api";

type Props = {
  id: string;
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
  onUploadStart: () => void;
  onUploadEnd: () => void;
};

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Traitement de l'image impossible.";
}

export function ProductVariantImageField({
  id,
  label,
  value,
  onChange,
  onUploadStart,
  onUploadEnd,
}: Props) {
  const [remoteUrl, setRemoteUrl] = useState("");
  const [processing, setProcessing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  const processImage = async (operation: () => Promise<string>) => {
    setProcessing(true);
    setError("");
    onUploadStart();
    try {
      onChange(await operation());
      return true;
    } catch (caught) {
      setError(errorMessage(caught));
      return false;
    } finally {
      setProcessing(false);
      onUploadEnd();
    }
  };

  const uploadFile = (file: File) => processImage(() => uploadAdminProductImage(file));

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    await uploadFile(file);
    input.value = "";
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (processing) return;
    const file = event.dataTransfer.files?.[0];
    if (file) await uploadFile(file);
  };

  const handleRemoteImport = async () => {
    const sourceUrl = remoteUrl.trim();
    if (!sourceUrl) {
      setError("Ajoutez une URL HTTPS avant de lancer l'import.");
      return;
    }
    if (await processImage(() => importAdminProductImageUrl(sourceUrl))) {
      setRemoteUrl("");
    }
  };

  return (
    <div className="col-span-full min-w-0 space-y-2">
      <Label htmlFor={`${id}-upload`}>{label}</Label>
      {value ? (
        <div className="flex min-w-0 items-center gap-3 rounded-md border bg-muted/30 p-2.5">
          <img
            src={value}
            alt="Aperçu de la variante"
            loading="lazy"
            className="h-16 w-16 shrink-0 rounded-md border bg-background object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Image associée</p>
            <p className="text-xs text-muted-foreground">
              Les nouveaux imports sont optimisés en WebP
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="min-h-11 min-w-11 shrink-0 text-destructive hover:text-destructive"
            onClick={() => onChange(null)}
            disabled={processing}
            aria-label="Retirer l'image"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex min-h-20 items-center justify-center gap-2 rounded-md border border-dashed bg-muted/20 p-3 text-xs text-muted-foreground">
          <ImageIcon className="h-5 w-5" /> Aucune image spécifique
        </div>
      )}

      <div
        className={`rounded-md border border-dashed p-3 transition-colors ${dragging ? "border-primary bg-primary/5" : ""}`}
        onDragEnter={(event) => {
          event.preventDefault();
          if (!processing) setDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <div className="mb-2 flex items-center gap-2 text-xs font-medium">
          {processing ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {processing
            ? "Conversion WebP en cours…"
            : value
              ? "Remplacer l'image"
              : "Téléverser une image"}
        </div>
        {processing ? (
          <div
            role="progressbar"
            aria-label="Traitement de l'image"
            className="mb-3 h-1.5 overflow-hidden rounded-full bg-muted"
          >
            <span className="block h-full w-2/3 animate-pulse rounded-full bg-gold" />
          </div>
        ) : null}
        <Input
          id={`${id}-upload`}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFile}
          disabled={processing}
          className="cursor-pointer"
        />
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
          Glissez-déposez ou choisissez un fichier JPEG, PNG, WebP ou GIF, 5 Mo maximum. Conversion
          automatique en WebP.
        </p>
      </div>

      <details className="rounded-md border bg-background p-3">
        <summary className="flex min-h-8 cursor-pointer list-none items-center gap-2 text-xs font-medium">
          <Link2 className="h-4 w-4" /> Importer depuis une URL
        </summary>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Input
            type="url"
            inputMode="url"
            value={remoteUrl}
            onChange={(event) => setRemoteUrl(event.target.value)}
            placeholder="https://exemple.com/image.jpg"
            disabled={processing}
            aria-label="URL de l'image à importer"
          />
          <Button
            type="button"
            variant="outline"
            className="min-h-11 w-full sm:w-auto"
            onClick={handleRemoteImport}
            disabled={processing || !remoteUrl.trim()}
          >
            Importer
          </Button>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
          L'image distante sera sécurisée, réhébergée et convertie en WebP.
        </p>
      </details>

      {error ? (
        <p role="alert" className="text-xs leading-relaxed text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
