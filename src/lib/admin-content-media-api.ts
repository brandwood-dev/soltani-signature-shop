import { apiFetch } from "@/lib/api";

export async function migrateAdminContentImages() {
  return apiFetch<{ migrated: number }>("/content/admin/images/migrate-legacy", {
    method: "POST",
  });
}
