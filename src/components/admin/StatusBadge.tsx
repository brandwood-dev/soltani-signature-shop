import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  draft: "bg-muted text-muted-foreground border-border",
  archived: "bg-zinc-500/10 text-zinc-700 border-zinc-500/20",
  pending: "bg-amber-500/10 text-amber-700 border-amber-500/30",
  processing: "bg-blue-500/10 text-blue-700 border-blue-500/30",
  shipped: "bg-indigo-500/10 text-indigo-700 border-indigo-500/30",
  delivered: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
  cancelled: "bg-rose-500/10 text-rose-700 border-rose-500/30",
};

const labels: Record<string, string> = {
  active: "Actif",
  draft: "Brouillon",
  archived: "Archivé",
  pending: "En attente",
  processing: "En préparation",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full px-2 py-0 text-[10px] font-medium uppercase tracking-wide", styles[status])}
    >
      {labels[status] ?? status}
    </Badge>
  );
}
