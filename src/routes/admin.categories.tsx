import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MOCK_PRODUCTS } from "@/lib/admin/mock-data";

export const Route = createFileRoute("/admin/categories")({
  component: AdminCategories,
});

function AdminCategories() {
  const categories = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of MOCK_PRODUCTS) map.set(p.category, (map.get(p.category) ?? 0) + 1);
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, []);

  return (
    <>
      <AdminHeader
        title="Catégories"
        subtitle={`${categories.length} catégories`}
        actions={
          <Button size="sm" className="h-9">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nouvelle catégorie</span>
            <span className="sm:hidden">Ajouter</span>
          </Button>
        }
      />

      <div className="flex-1 p-3 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <Card key={c.name} className="group transition hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold">{c.name}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {c.count} produit{c.count > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1 opacity-0 transition group-hover:opacity-100">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
